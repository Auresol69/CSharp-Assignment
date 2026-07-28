using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InteractHub_API.Agents.Services;

// ═══════════════════════════════════════════════════════════════════
// LLM Client – Interface + OpenAI-compatible implementation
// Tương thích: OpenAI, Gemini (via OpenAI endpoint), Groq, Together…
// ═══════════════════════════════════════════════════════════════════

public interface ILlmClient
{
    /// <summary>Gửi prompt tới LLM và nhận response.</summary>
    Task<LlmChatResponse> ChatAsync(
        string systemPrompt,
        string userMessage,
        double temperature = 0.1,
        bool jsonMode = false,
        CancellationToken ct = default);

    /// <summary>True nếu API key đã được cấu hình đúng.</summary>
    bool IsConfigured { get; }
}

public class LlmChatResponse
{
    public string Content { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
}

// ─── OpenAI-compatible implementation ────────────────────────────

public class OpenAiLlmClient : ILlmClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAiLlmClient> _logger;
    private readonly string _model;
    private readonly string _apiKey;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_apiKey) &&
        !_apiKey.Equals("sk-your-api-key-here", StringComparison.OrdinalIgnoreCase);

    public OpenAiLlmClient(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OpenAiLlmClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _apiKey = configuration["LLM:OpenAI:ApiKey"] ?? "";
        _model = configuration["LLM:OpenAI:Model"] ?? "gpt-4o-mini";
        var baseUrl = configuration["LLM:OpenAI:BaseUrl"] ?? "https://api.openai.com/v1";

        _httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);

        if (IsConfigured)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
        }
    }

    public async Task<LlmChatResponse> ChatAsync(
        string systemPrompt,
        string userMessage,
        double temperature = 0.1,
        bool jsonMode = false,
        CancellationToken ct = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("LLM API key chưa được cấu hình.");

        // Tạo request body theo chuẩn OpenAI
        var body = new Dictionary<string, object>
        {
            ["model"] = _model,
            ["temperature"] = temperature,
            ["messages"] = new object[]
            {
                new Dictionary<string, string> { ["role"] = "system", ["content"] = systemPrompt },
                new Dictionary<string, string> { ["role"] = "user", ["content"] = userMessage }
            }
        };

        if (jsonMode)
            body["response_format"] = new Dictionary<string, string> { ["type"] = "json_object" };

        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _logger.LogInformation("→ LLM call: model={Model}, msgLen={Len}", _model, userMessage.Length);

        // Hỗ trợ cả Google AI Studio lẫn OpenAI chuẩn
        var requestUrl = "chat/completions";
        if (_httpClient.BaseAddress != null && _httpClient.BaseAddress.Host.Contains("googleapis"))
        {
            requestUrl += $"?key={_apiKey}";
        }

        var response = await _httpClient.PostAsync(requestUrl, content, ct);
        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("LLM API error {Code}: {Body}", response.StatusCode, responseBody);
            throw new HttpRequestException($"LLM API lỗi {response.StatusCode}: {responseBody}");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;

        var messageContent = root
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";

        int promptTokens = 0, completionTokens = 0;
        if (root.TryGetProperty("usage", out var usage))
        {
            if (usage.TryGetProperty("prompt_tokens", out var pt)) promptTokens = pt.GetInt32();
            if (usage.TryGetProperty("completion_tokens", out var cpt)) completionTokens = cpt.GetInt32();
        }

        _logger.LogInformation("← LLM done: tokens={Prompt}+{Completion}",
            promptTokens, completionTokens);

        return new LlmChatResponse
        {
            Content = messageContent,
            PromptTokens = promptTokens,
            CompletionTokens = completionTokens
        };
    }
}
