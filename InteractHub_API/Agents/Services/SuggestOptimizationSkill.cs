using InteractHub_API.Agents.DTOs;
using System.Text;
using System.Text.Json;

namespace InteractHub_API.Agents.Services;

/// <inheritdoc />
public class SuggestOptimizationSkill : ISuggestOptimizationSkill
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SuggestOptimizationSkill> _logger;

    public SuggestOptimizationSkill(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<SuggestOptimizationSkill> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<SuggestOptimizationResponseDto> ExecuteAsync(
        string postContent,
        List<string>? mediaUrls = null,
        string language = "en")
    {
        if (string.IsNullOrWhiteSpace(postContent))
        {
            throw new ArgumentException("Post content cannot be null or empty.", nameof(postContent));
        }

        try
        {
            // Get LLM API key from configuration
            var apiKey = _configuration["LLM:OpenAI:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("LLM API key not configured. Returning empty suggestions.");
                return new SuggestOptimizationResponseDto { Suggestions = new() };
            }

            // Build the prompt
            var prompt = BuildOptimizationPrompt(postContent, mediaUrls, language);

            // Call LLM (example using OpenAI)
            var suggestions = await CallLlmAsync(apiKey, prompt);

            return new SuggestOptimizationResponseDto
            {
                Suggestions = suggestions,
                LlmPrompt = prompt // Can be redacted if needed
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating optimization suggestions");
            throw;
        }
    }

    private string BuildOptimizationPrompt(string postContent, List<string>? mediaUrls, string language)
    {
        var sb = new StringBuilder();
        sb.AppendLine($"You are a social media optimization expert (language: {language}).");
        sb.AppendLine("Analyze the following post content and provide up to 5 actionable suggestions.");
        sb.AppendLine("Return JSON with array of suggestions: [{ type: 'caption'|'hashtag'|'image'|'tone', text: string, confidence: 0..1 }]");
        sb.AppendLine();
        sb.AppendLine("Post content:");
        sb.AppendLine(postContent);

        if (mediaUrls?.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("Attached media URLs:");
            foreach (var url in mediaUrls)
            {
                sb.AppendLine($"- {url}");
            }
        }

        sb.AppendLine();
        sb.AppendLine("Provide optimization suggestions in JSON format:");

        return sb.ToString();
    }

    private async Task<List<OptimizationSuggestionDto>> CallLlmAsync(string apiKey, string prompt)
    {
        // Placeholder implementation - replace with actual OpenAI/LLM API call
        // This is a minimal stub that returns empty suggestions
        _logger.LogInformation("Calling LLM with prompt of length: {PromptLength}", prompt.Length);

        try
        {
            // Example: call OpenAI API or similar
            // var response = await _httpClient.PostAsync(...);
            // var content = await response.Content.ReadAsStringAsync();
            // var parsedSuggestions = JsonSerializer.Deserialize<List<OptimizationSuggestionDto>>(content);

            // For now, return empty list (implement actual LLM integration as needed)
            return new List<OptimizationSuggestionDto>
            {
                new() { Type = "caption", Text = "[Placeholder: LLM integration needed]", Confidence = 0.5 },
                new() { Type = "hashtag", Text = "#optimize #readmore", Confidence = 0.6 }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LLM API call failed");
            throw;
        }
    }
}
