using InteractHub_API.Agents.DTOs;

namespace InteractHub_API.Agents.Services;

/// <summary>
/// Interface for the AnalyzePostPerformance skill.
/// Query Redis/SQL for post metrics and compute engagement KPIs.
/// </summary>
public interface IAnalyzePostPerformanceSkill
{
    Task<AnalyzePostPerformanceResponseDto> ExecuteAsync(string postId);
}

/// <summary>
/// Interface for the SuggestOptimization skill.
/// Use LLM to analyze post content and provide caption/image/hashtag suggestions.
/// </summary>
public interface ISuggestOptimizationSkill
{
    Task<SuggestOptimizationResponseDto> ExecuteAsync(string postContent, List<string>? mediaUrls = null, string language = "en");
}

/// <summary>
/// Interface for the GetTrendingTopics skill.
/// Query Redis sorted sets for trending topics in a category.
/// </summary>
public interface IGetTrendingTopicsSkill
{
    Task<GetTrendingTopicsResponseDto> ExecuteAsync(string category = "global", int limit = 10);
}
