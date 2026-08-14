using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace InteractHub_API.Agents.Services;

// ═══════════════════════════════════════════════════════════════════
// Embedding Service
// Calls an OpenAI-compatible /embeddings endpoint and returns a
// float32 vector. Reuses the same HttpClient pattern as OpenAiLlmClient.
// ═══════════════════════════════════════════════════════════════════

public interface IEmbeddingService
{
    /// <summary>
    /// Embed a single text string and return the raw float32 vector.
    /// </summary>
    Task<float[]> EmbedAsync(string text, CancellationToken ct = default);

    /// <summary>
    /// True when the API key and endpoint are configured.
    /// </summary>
    bool IsConfigured { get; }
}

public class OpenAiEmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAiEmbeddingService> _logger;
    private readonly string _model;
    private readonly string _apiKey;
    private readonly bool _isGoogleEndpoint;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_apiKey) &&
        !_apiKey.Equals("sk-your-api-key-here", StringComparison.OrdinalIgnoreCase);

    public OpenAiEmbeddingService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OpenAiEmbeddingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _apiKey = configuration["LLM:OpenAI:ApiKey"] ?? "";
        var baseUrl = configuration["LLM:OpenAI:BaseUrl"] ?? "https://api.openai.com/v1";
        _isGoogleEndpoint = baseUrl.Contains("googleapis");

        var configuredModel = configuration["ChatBot:Embedding:Model"] ?? "text-embedding-3-small";
        _model = (_isGoogleEndpoint && configuredModel == "text-embedding-3-small")
            ? "text-embedding-004"
            : configuredModel;

        _httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);

        if (IsConfigured && !_isGoogleEndpoint)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
        }
    }

    public async Task<float[]> EmbedAsync(string text, CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("EmbeddingService: API key not configured. Returning zero vector.");
            return new float[1536];
        }

        string requestUrl;
        string json;

        if (_isGoogleEndpoint)
        {
            requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:embedContent?key={_apiKey}";
            var googleBody = new
            {
                model = $"models/{_model}",
                content = new
                {
                    parts = new[] { new { text } }
                }
            };
            json = JsonSerializer.Serialize(googleBody);
        }
        else
        {
            requestUrl = "embeddings";
            var body = new { model = _model, input = text };
            json = JsonSerializer.Serialize(body);
        }

        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _logger.LogDebug("→ Embedding call: model={Model}, textLen={Len}", _model, text.Length);

        var response = await _httpClient.PostAsync(requestUrl, content, ct);
        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Embedding API error {Code}: {Body}", response.StatusCode, responseBody);
            throw new HttpRequestException($"Embedding API error {response.StatusCode}: {responseBody}");
        }

        using var doc = JsonDocument.Parse(responseBody);

        JsonElement embeddingArray;
        if (_isGoogleEndpoint)
        {
            // Google format: { "embedding": { "values": [0.1, 0.2, ...] } }
            embeddingArray = doc.RootElement
                .GetProperty("embedding")
                .GetProperty("values");
        }
        else
        {
            // OpenAI format: { "data": [{ "embedding": [0.1, 0.2, ...] }] }
            embeddingArray = doc.RootElement
                .GetProperty("data")[0]
                .GetProperty("embedding");
        }

        var floats = new float[embeddingArray.GetArrayLength()];
        var i = 0;
        foreach (var el in embeddingArray.EnumerateArray())
        {
            floats[i++] = el.GetSingle();
        }

        _logger.LogDebug("← Embedding done: dims={Dims}", floats.Length);
        return floats;
    }

    // ──────────────────────────────────────────────────────────────
    // Static helpers shared across services
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Serialise a float32 array to raw bytes (little-endian) for Redis storage.
    /// </summary>
    public static byte[] ToBytes(float[] vector)
    {
        var bytes = new byte[vector.Length * sizeof(float)];
        MemoryMarshal.Cast<float, byte>(vector).CopyTo(bytes);
        return bytes;
    }

    /// <summary>
    /// Deserialise raw bytes back to float32 array.
    /// </summary>
    public static float[] FromBytes(byte[] bytes)
    {
        var floats = new float[bytes.Length / sizeof(float)];
        MemoryMarshal.Cast<byte, float>(bytes).CopyTo(floats);
        return floats;
    }

    /// <summary>
    /// Compute cosine similarity between two vectors in [0, 1].
    /// </summary>
    public static double CosineSimilarity(float[] a, float[] b)
    {
        if (a.Length != b.Length) return 0.0;

        double dot = 0, normA = 0, normB = 0;
        for (var i = 0; i < a.Length; i++)
        {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.Sqrt(normA) * Math.Sqrt(normB));
    }
}
