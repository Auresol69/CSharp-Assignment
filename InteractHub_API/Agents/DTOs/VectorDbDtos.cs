namespace InteractHub_API.Agents.DTOs;

// ═══════════════════════════════════════════════════════════════════
// Vector Database (RAG) – DTOs for HNSW index + KNN search
// ═══════════════════════════════════════════════════════════════════

/// <summary>
/// Request to index a document chunk into the Redis vector store.
/// </summary>
public class IndexDocumentRequest
{
    /// <summary>Unique document/chunk identifier (used as part of the Redis key).</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Raw text content of this chunk.</summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>Origin of the document (e.g., filename, URL, DB table name).</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>Optional arbitrary metadata stored alongside the chunk.</summary>
    public Dictionary<string, string> Metadata { get; set; } = new();
}

/// <summary>
/// A single retrieved document chunk with its relevance score.
/// </summary>
public class DocumentChunk
{
    public string Id { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public Dictionary<string, string> Metadata { get; set; } = new();

    /// <summary>
    /// Cosine similarity score (0–1) from the KNN search.
    /// Higher is more relevant.
    /// </summary>
    public double Score { get; set; }
}

/// <summary>
/// Result of a vector similarity search.
/// </summary>
public class VectorSearchResult
{
    public List<DocumentChunk> Chunks { get; set; } = new();
    public int TopK { get; set; }
    public int QueryEmbeddingDimensions { get; set; }
    public double SearchLatencyMs { get; set; }

    /// <summary>Formatted context string ready to inject into an LLM prompt.</summary>
    public string RagContext { get; set; } = string.Empty;
}

/// <summary>
/// Statistics about the vector index.
/// </summary>
public class VectorIndexInfo
{
    public string IndexName { get; set; } = string.Empty;
    public long NumDocs { get; set; }
    public long NumVectors { get; set; }
    public bool Exists { get; set; }
}
