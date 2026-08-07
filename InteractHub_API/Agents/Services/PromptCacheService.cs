using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using InteractHub_API.Agents.DTOs;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

// ═══════════════════════════════════════════════════════════════════
// Prompt Cache Service – Feature 2
//
// Two-layer cache to avoid redundant LLM calls:
//
//   Layer 1 – Exact hash (SHA-256 of normalised query)
//     Key: cache:exact:{sha256hex}
//     Value: Redis String (serialised CacheEntry JSON)
//     TTL: configurable (default 24 h)
//
//   Layer 2 – Semantic similarity (cosine over stored embeddings)
//     Key pattern: cache:vec:*
//     Value: Redis Hash { queryText, response, embedding (raw float32 bytes) }
//     Threshold: 0.92 (configurable)
//     Strategy: SCAN + in-process cosine over candidate set
//
// Usage pattern:
//   1. Call TryGetCachedAsync  → returns CacheHit on hit
//   2. On miss: call LLM, then SetCacheAsync
// ═══════════════════════════════════════════════════════════════════

public interface IPromptCacheService
{
    /// <summary>
    /// Try to find an exact or semantically similar cached response.
    /// Returns <c>null</c> on a miss.
    /// </summary>
    Task<CacheHit?> TryGetCachedAsync(string query, CancellationToken ct = default);

    /// <summary>
    /// Persist a new Q&amp;A pair in both the exact-hash store and the
    /// semantic vector store.
    /// </summary>
    Task SetCacheAsync(string query, string response, CancellationToken ct = default);

    /// <summary>
    /// Evict a specific entry by its exact query string.
    /// </summary>
    Task InvalidateAsync(string query, CancellationToken ct = default);
}

public class PromptCacheService : IPromptCacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IEmbeddingService _embedding;
    private readonly ILogger<PromptCacheService> _logger;
    private readonly double _similarityThreshold;
    private readonly TimeSpan _cacheTtl;

    // Key templates
    private static string ExactKey(string hash)      => $"cache:exact:{hash}";
    private const  string VecKeyPrefix               =  "cache:vec:";
    private static string VecKey(string id)          => $"{VecKeyPrefix}{id}";

    // Redis Hash field names for the semantic store
    private const string FieldQueryText  = "queryText";
    private const string FieldResponse   = "response";
    private const string FieldEmbedding  = "embedding";

    public PromptCacheService(
        IConnectionMultiplexer redis,
        IEmbeddingService embedding,
        IConfiguration configuration,
        ILogger<PromptCacheService> logger)
    {
        _redis = redis;
        _embedding = embedding;
        _logger = logger;
        _similarityThreshold = configuration.GetValue("ChatBot:CacheSimilarityThreshold", 0.92);
        _cacheTtl = TimeSpan.FromHours(configuration.GetValue("ChatBot:CacheTtlHours", 24.0));
    }

    // ──────────────────────────────────────────────────────────────
    // TryGetCachedAsync
    // ──────────────────────────────────────────────────────────────

    public async Task<CacheHit?> TryGetCachedAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query)) return null;

        var sw = Stopwatch.StartNew();

        // ── Layer 1: exact hash ──────────────────────────────────
        var hash   = ComputeHash(query);
        var db     = _redis.GetDatabase();
        var cached = await db.StringGetAsync(ExactKey(hash));

        if (cached.HasValue)
        {
            sw.Stop();
            _logger.LogInformation("Cache HIT (exact) for hash {Hash} [{Ms:F1} ms]", hash[..8], sw.Elapsed.TotalMilliseconds);
            try
            {
                var entry = JsonSerializer.Deserialize<CacheEntry>(cached.ToString());
                if (entry is not null)
                    return new CacheHit
                    {
                        Response   = entry.Response,
                        Source     = CacheSource.ExactHash,
                        Similarity = 1.0,
                        LatencyMs  = sw.Elapsed.TotalMilliseconds
                    };
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Cache: failed to deserialise exact entry for hash {Hash}", hash);
            }
        }

        // ── Layer 2: semantic similarity ─────────────────────────
        if (!_embedding.IsConfigured)
        {
            _logger.LogDebug("Cache MISS (embedding not configured, skipping semantic search).");
            return null;
        }

        float[] queryEmbedding;
        try
        {
            queryEmbedding = await _embedding.EmbedAsync(query, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cache: embedding failed during semantic lookup.");
            return null;
        }

        var bestSimilarity = 0.0;
        var bestResponse   = string.Empty;

        // SCAN all vec keys – suitable for moderate cache sizes.
        // For very large caches, replace with RediSearch KNN (see VectorDbService).
        var server = _redis.GetServer(_redis.GetEndPoints()[0]);
        await foreach (var key in server.KeysAsync(pattern: VecKey("*")))
        {
            ct.ThrowIfCancellationRequested();
            try
            {
                var fields = await db.HashGetAsync(key.ToString(),
                    [FieldEmbedding, FieldResponse]);

                if (!fields[0].HasValue || !fields[1].HasValue) continue;

                var storedBytes     = (byte[])fields[0]!;
                var storedEmbedding = OpenAiEmbeddingService.FromBytes(storedBytes);
                var similarity      = OpenAiEmbeddingService.CosineSimilarity(queryEmbedding, storedEmbedding);

                if (similarity > bestSimilarity)
                {
                    bestSimilarity = similarity;
                    bestResponse   = fields[1].ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache: error reading semantic entry {Key}", key);
            }
        }

        sw.Stop();

        if (bestSimilarity >= _similarityThreshold)
        {
            _logger.LogInformation(
                "Cache HIT (semantic) similarity={Sim:F4} threshold={Thr} [{Ms:F1} ms]",
                bestSimilarity, _similarityThreshold, sw.Elapsed.TotalMilliseconds);

            return new CacheHit
            {
                Response   = bestResponse,
                Source     = CacheSource.SemanticSimilarity,
                Similarity = bestSimilarity,
                LatencyMs  = sw.Elapsed.TotalMilliseconds
            };
        }

        _logger.LogDebug(
            "Cache MISS (best similarity={Sim:F4} < threshold={Thr}) [{Ms:F1} ms]",
            bestSimilarity, _similarityThreshold, sw.Elapsed.TotalMilliseconds);

        return null;
    }

    // ──────────────────────────────────────────────────────────────
    // SetCacheAsync
    // ──────────────────────────────────────────────────────────────

    public async Task SetCacheAsync(string query, string response, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query)) return;

        var db   = _redis.GetDatabase();
        var hash = ComputeHash(query);

        // ── Layer 1: exact hash entry ────────────────────────────
        var entry = new CacheEntry
        {
            QueryHash  = hash,
            QueryText  = query,
            Response   = response,
            CreatedAt  = DateTimeOffset.UtcNow
        };
        var json = JsonSerializer.Serialize(entry);
        await db.StringSetAsync(ExactKey(hash), json, _cacheTtl);

        // ── Layer 2: semantic entry ──────────────────────────────
        if (!_embedding.IsConfigured)
        {
            _logger.LogDebug("Cache: skipping semantic store (embedding not configured).");
            return;
        }

        float[] embedding;
        try
        {
            embedding = await _embedding.EmbedAsync(query, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cache: embedding failed during SetCache. Exact-hash entry saved.");
            return;
        }

        var embBytes = OpenAiEmbeddingService.ToBytes(embedding);
        var vecKey   = VecKey(hash);

        await db.HashSetAsync(vecKey,
        [
            new HashEntry(FieldQueryText, query),
            new HashEntry(FieldResponse,  response),
            new HashEntry(FieldEmbedding, embBytes)
        ]);
        await db.KeyExpireAsync(vecKey, _cacheTtl);

        _logger.LogDebug(
            "Cache: stored entry hash={Hash} embDims={Dims} ttl={Ttl}",
            hash[..8], embedding.Length, _cacheTtl);
    }

    // ──────────────────────────────────────────────────────────────
    // InvalidateAsync
    // ──────────────────────────────────────────────────────────────

    public async Task InvalidateAsync(string query, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query)) return;

        var db   = _redis.GetDatabase();
        var hash = ComputeHash(query);

        var batch = db.CreateBatch();
        var t1    = batch.KeyDeleteAsync(ExactKey(hash));
        var t2    = batch.KeyDeleteAsync(VecKey(hash));
        batch.Execute();
        await Task.WhenAll(t1, t2);

        _logger.LogInformation("Cache: invalidated entry hash={Hash}", hash[..8]);
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// SHA-256 of the lower-cased, trimmed query (hex string, 64 chars).
    /// </summary>
    private static string ComputeHash(string query)
    {
        var normalised = query.Trim().ToLowerInvariant();
        var bytes      = SHA256.HashData(Encoding.UTF8.GetBytes(normalised));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
