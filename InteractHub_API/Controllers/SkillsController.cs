using InteractHub_API.Agents.Services;
using InteractHub_API.Agents.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

/// <summary>
/// API endpoints for interacting with skills.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly IAnalyzePostPerformanceSkill _analyzeSkill;
    private readonly ISuggestOptimizationSkill _suggestSkill;
    private readonly IGetTrendingTopicsSkill _trendingSkill;
    private readonly ILogger<SkillsController> _logger;

    public SkillsController(
        IAnalyzePostPerformanceSkill analyzeSkill,
        ISuggestOptimizationSkill suggestSkill,
        IGetTrendingTopicsSkill trendingSkill,
        ILogger<SkillsController> logger)
    {
        _analyzeSkill = analyzeSkill;
        _suggestSkill = suggestSkill;
        _trendingSkill = trendingSkill;
        _logger = logger;
    }

    /// <summary>
    /// Analyze post performance metrics (likes, comments, reposts, impressions).
    /// </summary>
    [HttpGet("analyze-performance/{postId}")]
    [ProducesResponseType(typeof(AnalyzePostPerformanceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AnalyzePostPerformance(string postId)
    {
        try
        {
            var result = await _analyzeSkill.ExecuteAsync(postId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for AnalyzePostPerformance");
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Post not found");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing post performance");
            return StatusCode(500, new { error = "An error occurred while analyzing post performance." });
        }
    }

    /// <summary>
    /// Get optimization suggestions for a post using LLM analysis.
    /// </summary>
    [HttpPost("suggest-optimization")]
    [ProducesResponseType(typeof(SuggestOptimizationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SuggestOptimization([FromBody] SuggestOptimizationRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.PostContent))
            {
                return BadRequest(new { error = "PostContent is required." });
            }

            var language = request.Language ?? "en";
            var result = await _suggestSkill.ExecuteAsync(request.PostContent, request.MediaUrls, language);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for SuggestOptimization");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating optimization suggestions");
            return StatusCode(500, new { error = "An error occurred while generating suggestions." });
        }
    }

    /// <summary>
    /// Get trending topics for a category from Redis.
    /// </summary>
    [HttpGet("trending-topics")]
    [ProducesResponseType(typeof(GetTrendingTopicsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetTrendingTopics([FromQuery] string? category = "global", [FromQuery] int limit = 10)
    {
        try
        {
            var result = await _trendingSkill.ExecuteAsync(category ?? "global", limit);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching trending topics");
            return StatusCode(500, new { error = "An error occurred while fetching trending topics." });
        }
    }
}

/// <summary>
/// Request DTO for SuggestOptimization endpoint.
/// </summary>
public class SuggestOptimizationRequestDto
{
    public string PostContent { get; set; }
    public List<string>? MediaUrls { get; set; }
    public string? Language { get; set; }
}
