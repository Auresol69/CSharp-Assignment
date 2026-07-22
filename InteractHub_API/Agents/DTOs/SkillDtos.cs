namespace InteractHub_API.Agents.DTOs;

/// <summary>
/// DTO for AnalyzePostPerformance skill - metrics and interaction data.
/// </summary>
public class PostPerformanceMetricsDto
{
    public int Likes { get; set; }
    public int Comments { get; set; }
    public int Reposts { get; set; }
    public int Impressions { get; set; }
    public double EngagementRate { get; set; } // (likes + comments + reposts) / impressions
    public double? Ctr { get; set; } // click-through rate (optional)
}

public class PostPerformanceSourceDto
{
    public int Value { get; set; }
    public string Source { get; set; } // "redis" or "sql"
}

public class PostPerformanceRawSourcesDto
{
    public PostPerformanceSourceDto Likes { get; set; }
    public PostPerformanceSourceDto Comments { get; set; }
    public PostPerformanceSourceDto Reposts { get; set; }
    public PostPerformanceSourceDto Impressions { get; set; }
}

public class AnalyzePostPerformanceResponseDto
{
    public PostPerformanceMetricsDto Metrics { get; set; }
    public PostPerformanceRawSourcesDto RawSources { get; set; }
}

/// <summary>
/// DTO for SuggestOptimization skill - LLM-generated optimization suggestions.
/// </summary>
public class OptimizationSuggestionDto
{
    public string Type { get; set; } // "caption" | "hashtag" | "image" | "tone"
    public string Text { get; set; }
    public double? Confidence { get; set; } // 0..1
}

public class SuggestOptimizationResponseDto
{
    public List<OptimizationSuggestionDto> Suggestions { get; set; } = new();
    public string LlmPrompt { get; set; } // Redacted prompt for auditing
}

/// <summary>
/// DTO for GetTrendingTopics skill - trending topics from Redis sorted sets.
/// </summary>
public class TrendingTopicDto
{
    public string Topic { get; set; }
    public double Score { get; set; }
}

public class GetTrendingTopicsResponseDto
{
    public List<TrendingTopicDto> Topics { get; set; } = new();
}
