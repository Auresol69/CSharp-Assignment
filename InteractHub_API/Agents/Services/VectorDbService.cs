using System.Diagnostics;
using System.Text;
using System.Text.Json;
using InteractHub_API.Agents.DTOs;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

// ═══════════════════════════════════════════════════════════════════
// Vector DB Service – Feature 3 (RAG)
//
// Manages a Redis HNSW vector index via raw RediSearch commands
// sent through StackExchange.Redis's ExecuteAsync.
//
// Key layout:
//   doc:{id}  → Redis Hash
//     text        – raw chunk text
//     source      – document origin (URL, filename, …)
//     embedding   – raw float32 bytes (little-endian)
//     metadata    – JSON string of Dictionary<string,string>
//
// Index name: configured via ChatBot:VectorIndex:IndexName (default "chatbot-docs")
// Algorithm:  HNSW  |  Distance: COSINE  |  Dims: 1536 (configurable)
// ═══════════════════════════════════════════════════════════════════

public interface IVectorDbService
{
    /// <summary>
    /// Idempotently create the HNSW RediSearch vector index.
    /// Call once at startup (e.g., from a hosted service or DI registration).
    /// </summary>
    Task EnsureIndexAsync(CancellationToken ct = default);

    /// <summary>
    /// Embed a document chunk and store it in the vector index.
    /// If a document with the same <paramref name="request.Id"/> already exists it is overwritten.
    /// </summary>
    Task IndexDocumentAsync(IndexDocumentRequest request, CancellationToken ct = default);

    /// <summary>
    /// Embed the <paramref name="query"/>, perform a KNN search, and return the
    /// top-K most semantically similar document chunks.
    /// </summary>
    Task<VectorSearchResult> SearchAsync(string query, int? topK = null, CancellationToken ct = default);

    /// <summary>
    /// Remove a specific document chunk from the index.
    /// </summary>
    Task DeleteDocumentAsync(string id, CancellationToken ct = default);

    /// <summary>
    /// Return basic statistics about the vector index.
    /// </summary>
    Task<VectorIndexInfo> GetIndexInfoAsync(CancellationToken ct = default);
}

public class VectorDbService : IVectorDbService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IEmbeddingService _embedding;
    private readonly ILogger<VectorDbService> _logger;

    private readonly string _indexName;
    private readonly int    _dimensions;
    private readonly int    _defaultTopK;

    private const string DocKeyPrefix = "doc:";
    private static string DocKey(string id) => $"{DocKeyPrefix}{id}";

    // Hash field names
    private const string FText      = "text";
    private const string FSource    = "source";
    private const string FEmbedding = "embedding";
    private const string FMetadata  = "metadata";

    public VectorDbService(
        IConnectionMultiplexer redis,
        IEmbeddingService embedding,
        IConfiguration configuration,
        ILogger<VectorDbService> logger)
    {
        _redis     = redis;
        _embedding = embedding;
        _logger    = logger;

        _indexName   = configuration["ChatBot:VectorIndex:IndexName"]      ?? "chatbot-docs";
        _dimensions  = configuration.GetValue("ChatBot:VectorIndex:EmbeddingDimensions", 1536);
        _defaultTopK = configuration.GetValue("ChatBot:VectorIndex:TopK",   5);
    }

    // ──────────────────────────────────────────────────────────────
    // EnsureIndexAsync – FT.CREATE (idempotent)
    // ──────────────────────────────────────────────────────────────

    public async Task EnsureIndexAsync(CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();

        try
        {
            // FT.CREATE <index> ON HASH PREFIX 1 doc:
            //   SCHEMA text TEXT source TEXT metadata TEXT
            //          embedding VECTOR HNSW 6 TYPE FLOAT32 DIM <dims> DISTANCE_METRIC COSINE
            await db.ExecuteAsync("FT.CREATE", [
                _indexName,
                "ON",        "HASH",
                "PREFIX",    "1",     DocKeyPrefix,
                "SCHEMA",
                FText,       "TEXT",
                FSource,     "TEXT",
                FMetadata,   "TEXT",
                FEmbedding,  "VECTOR", "HNSW",
                    "6",                         // number of HNSW attribute-value pairs
                    "TYPE",       "FLOAT32",
                    "DIM",        _dimensions.ToString(),
                    "DISTANCE_METRIC", "COSINE"
            ]);

            _logger.LogInformation(
                "VectorDb: created HNSW index '{Index}' (dims={Dims})", _indexName, _dimensions);
        }
        catch (RedisException ex) when (ex.Message.Contains("Index already exists"))
        {
            // Idempotent – index already there, nothing to do.
            _logger.LogDebug("VectorDb: index '{Index}' already exists.", _indexName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VectorDb: failed to create index '{Index}'.", _indexName);
            throw;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // IndexDocumentAsync – HSET doc:{id}
    // ──────────────────────────────────────────────────────────────

    public async Task IndexDocumentAsync(IndexDocumentRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Id))
            throw new ArgumentException("Document Id must not be empty.", nameof(request));
        if (string.IsNullOrWhiteSpace(request.Text))
            throw new ArgumentException("Document Text must not be empty.", nameof(request));

        // Generate embedding
        float[] embedding;
        try
        {
            embedding = await _embedding.EmbedAsync(request.Text, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VectorDb: failed to embed document {Id}.", request.Id);
            throw;
        }

        var db       = _redis.GetDatabase();
        var key      = DocKey(request.Id);
        var embBytes = OpenAiEmbeddingService.ToBytes(embedding);
        var metaJson = JsonSerializer.Serialize(request.Metadata ?? new Dictionary<string, string>());

        await db.HashSetAsync(key,
        [
            new HashEntry(FText,      request.Text),
            new HashEntry(FSource,    request.Source ?? string.Empty),
            new HashEntry(FMetadata,  metaJson),
            new HashEntry(FEmbedding, embBytes)
        ]);

        _logger.LogInformation(
            "VectorDb: indexed document '{Id}' from '{Source}' (embDims={Dims})",
            request.Id, request.Source, embedding.Length);
    }

    // ──────────────────────────────────────────────────────────────
    // SearchAsync – FT.SEARCH KNN
    // ──────────────────────────────────────────────────────────────

    public async Task<VectorSearchResult> SearchAsync(
        string query, int? topK = null, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Query must not be empty.", nameof(query));

        var k  = topK ?? _defaultTopK;
        var sw = Stopwatch.StartNew();

        // Embed the query
        float[] queryEmbedding;
        try
        {
            queryEmbedding = await _embedding.EmbedAsync(query, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VectorDb: failed to embed search query.");
            throw;
        }

        var db       = _redis.GetDatabase();
        var vecBytes = OpenAiEmbeddingService.ToBytes(queryEmbedding);

        // FT.SEARCH <index> "*=>[KNN {K} @embedding $vec AS score]"
        //   PARAMS 2 vec <bytes>
        //   SORTBY score ASC
        //   RETURN 4 text source metadata score
        //   DIALECT 2
        RedisResult rawResult;
        try
        {
            rawResult = await db.ExecuteAsync("FT.SEARCH", [
                _indexName,
                $"*=>[KNN {k} @{FEmbedding} $vec AS score]",
                "PARAMS",  "2",   "vec", vecBytes,
                "SORTBY",  "score", "ASC",
                "RETURN",  "4",   FText, FSource, FMetadata, "score",
                "DIALECT", "2"
            ]);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VectorDb: FT.SEARCH failed on index '{Index}'.", _indexName);
            throw;
        }

        sw.Stop();

        var chunks = ParseSearchResults(rawResult);
        var ragContext = BuildRagContext(chunks, query);

        _logger.LogInformation(
            "VectorDb: search returned {Count}/{K} chunks in {Ms:F1} ms",
            chunks.Count, k, sw.Elapsed.TotalMilliseconds);

        return new VectorSearchResult
        {
            Chunks                  = chunks,
            TopK                    = k,
            QueryEmbeddingDimensions = queryEmbedding.Length,
            SearchLatencyMs          = sw.Elapsed.TotalMilliseconds,
            RagContext               = ragContext
        };
    }

    // ──────────────────────────────────────────────────────────────
    // DeleteDocumentAsync
    // ──────────────────────────────────────────────────────────────

    public async Task DeleteDocumentAsync(string id, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Id must not be empty.", nameof(id));

        var db      = _redis.GetDatabase();
        var deleted = await db.KeyDeleteAsync(DocKey(id));

        _logger.LogInformation(
            "VectorDb: deleted document '{Id}' (existed={Existed})", id, deleted);
    }

    // ──────────────────────────────────────────────────────────────
    // GetIndexInfoAsync – FT.INFO
    // ──────────────────────────────────────────────────────────────

    public async Task<VectorIndexInfo> GetIndexInfoAsync(CancellationToken ct = default)
    {
        var db   = _redis.GetDatabase();
        var info = new VectorIndexInfo { IndexName = _indexName };

        try
        {
            var result = await db.ExecuteAsync("FT.INFO", _indexName);
            var items  = (RedisResult[])result!;

            // FT.INFO returns a flat array of alternating key/value pairs
            for (var i = 0; i < items.Length - 1; i += 2)
            {
                var fieldName = items[i].ToString();
                switch (fieldName)
                {
                    case "num_docs":
                        info.NumDocs = (long)items[i + 1];
                        break;
                    case "num_records":
                        info.NumVectors = (long)items[i + 1];
                        break;
                }
            }
            info.Exists = true;
        }
        catch (RedisException ex) when (ex.Message.Contains("Unknown Index name"))
        {
            info.Exists = false;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "VectorDb: FT.INFO failed for index '{Index}'.", _indexName);
        }

        return info;
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Parse the flat FT.SEARCH result array into a list of <see cref="DocumentChunk"/>.
    ///
    /// FT.SEARCH result layout:
    ///   [totalCount, key1, [field1, val1, field2, val2, …], key2, […], …]
    /// </summary>
    private static List<DocumentChunk> ParseSearchResults(RedisResult rawResult)
    {
        var chunks  = new List<DocumentChunk>();
        if (rawResult.IsNull) return chunks;

        var items = (RedisResult[]?)rawResult;
        if (items is null || items.Length < 2) return chunks;

        // items[0] = total count; items[1..] = key, fields pairs
        for (var i = 1; i < items.Length - 1; i += 2)
        {
            var docKey = items[i].ToString();
            var id     = docKey.StartsWith(DocKeyPrefix, StringComparison.Ordinal)
                         ? docKey[DocKeyPrefix.Length..]
                         : docKey;

            var chunk  = new DocumentChunk { Id = id };
            var fields = (RedisResult[]?)items[i + 1];
            if (fields is null) continue;

            for (var j = 0; j < fields.Length - 1; j += 2)
            {
                var name  = fields[j].ToString();
                var value = fields[j + 1].ToString();

                switch (name)
                {
                    case FText:
                        chunk.Text = value;
                        break;
                    case FSource:
                        chunk.Source = value;
                        break;
                    case FMetadata:
                        try
                        {
                            chunk.Metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(value)
                                             ?? new();
                        }
                        catch { chunk.Metadata = new(); }
                        break;
                    case "score":
                        // RediSearch returns COSINE distance (0 = identical, 2 = opposite).
                        // Convert to similarity in [0,1]: similarity = 1 - (distance / 2)
                        if (double.TryParse(value,
                                System.Globalization.NumberStyles.Float,
                                System.Globalization.CultureInfo.InvariantCulture,
                                out var dist))
                        {
                            chunk.Score = Math.Max(0, 1.0 - dist / 2.0);
                        }
                        break;
                }
            }

            chunks.Add(chunk);
        }

        return chunks;
    }

    /// <summary>
    /// Formats retrieved chunks into a structured context block for the LLM.
    /// </summary>
    private static string BuildRagContext(List<DocumentChunk> chunks, string query)
    {
        if (chunks.Count == 0) return string.Empty;

        var sb = new StringBuilder();
        sb.AppendLine("[Relevant context retrieved from knowledge base]");
        sb.AppendLine($"Query: {query}");
        sb.AppendLine();

        for (var i = 0; i < chunks.Count; i++)
        {
            var c = chunks[i];
            sb.AppendLine($"--- Source {i + 1}: {c.Source} (relevance: {c.Score:P0}) ---");
            sb.AppendLine(c.Text);
            sb.AppendLine();
        }

        return sb.ToString().TrimEnd();
    }
}
