namespace InteractHub_API.Agents.DTOs;

// ═══════════════════════════════════════════════════════════════════
// Prompt Cache – DTOs for exact-hash + semantic similarity caching
// ═══════════════════════════════════════════════════════════════════

/// <summary>
/// Describes how a cache lookup was resolved.
/// </summary>
public enum CacheSource
{
    /// <summary>SHA-256 exact match on the normalized query string.</summary>
    ExactHash,

    /// <summary>Cosine similarity exceeded the configured threshold.</summary>
    SemanticSimilarity,

    /// <summary>No cache hit — LLM was called.</summary>
    Miss
}

/// <summary>
/// Returned when a cached response is found.
/// </summary>
public class CacheHit
{
    /// <summary>The cached LLM response text.</summary>
    public string Response { get; set; } = string.Empty;

    /// <summary>How the hit was resolved.</summary>
    public CacheSource Source { get; set; }

    /// <summary>Cosine similarity score (0–1). 1.0 for exact hash hits.</summary>
    public double Similarity { get; set; } = 1.0;

    /// <summary>Cache lookup latency in milliseconds.</summary>
    public double LatencyMs { get; set; }
}

/// <summary>
/// Internal cache entry persisted to Redis.
/// </summary>
public class CacheEntry
{
    /// <summary>SHA-256 of the normalized query text.</summary>
    public string QueryHash { get; set; } = string.Empty;

    public string QueryText { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;

    /// <summary>Base64-encoded float32[] embedding for semantic search.</summary>
    public string EmbeddingBase64 { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// Result of a full chatbot turn (cache-aware).
/// </summary>
public class ChatbotTurnResult
{
    public string Query { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public CacheSource CacheSource { get; set; }
    public double Similarity { get; set; }
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public double TotalElapsedMs { get; set; }
}
