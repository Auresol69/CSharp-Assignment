using InteractHub_API.Agents.DTOs;
using InteractHub_Shared.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

/// <inheritdoc />
public class AnalyzePostPerformanceSkill : IAnalyzePostPerformanceSkill
{
    private readonly AppDbContext _dbContext;
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<AnalyzePostPerformanceSkill> _logger;

    public AnalyzePostPerformanceSkill(
        AppDbContext dbContext,
        IConnectionMultiplexer redis,
        ILogger<AnalyzePostPerformanceSkill> logger)
    {
        _dbContext = dbContext;
        _redis = redis;
        _logger = logger;
    }

    public async Task<AnalyzePostPerformanceResponseDto> ExecuteAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId cannot be null or empty.", nameof(postId));
        }

        var db = _redis.GetDatabase();
        var metrics = new PostPerformanceMetricsDto();
        var sources = new PostPerformanceRawSourcesDto();

        try
        {
            // Try to get metrics from Redis first
            var likesKey = $"post:{postId}:likes";
            var commentsKey = $"post:{postId}:comments";
            var repostsKey = $"post:{postId}:reposts";
            var impressionsKey = $"post:{postId}:impressions";

            var likesValue = await db.StringGetAsync(likesKey);
            var commentsValue = await db.StringGetAsync(commentsKey);
            var repostsValue = await db.StringGetAsync(repostsKey);
            var impressionsValue = await db.StringGetAsync(impressionsKey);

            bool needsSqlFallback = !likesValue.HasValue || !commentsValue.HasValue || 
                                    !repostsValue.HasValue || !impressionsValue.HasValue;

            if (needsSqlFallback)
            {
                // Fall back to SQL for authoritative counts
                _logger.LogInformation("Redis keys missing for post {PostId}. Falling back to SQL.", postId);
                await FetchMetricsFromSqlAsync(postId, metrics, sources);
            }
            else
            {
                // Populate from Redis
                metrics.Likes = (int)(likesValue.HasValue ? likesValue : 0);
                metrics.Comments = (int)(commentsValue.HasValue ? commentsValue : 0);
                metrics.Reposts = (int)(repostsValue.HasValue ? repostsValue : 0);
                metrics.Impressions = (int)(impressionsValue.HasValue ? impressionsValue : 0);

                sources.Likes = new PostPerformanceSourceDto { Value = metrics.Likes, Source = "redis" };
                sources.Comments = new PostPerformanceSourceDto { Value = metrics.Comments, Source = "redis" };
                sources.Reposts = new PostPerformanceSourceDto { Value = metrics.Reposts, Source = "redis" };
                sources.Impressions = new PostPerformanceSourceDto { Value = metrics.Impressions, Source = "redis" };
            }

            // Compute engagement rate
            metrics.EngagementRate = metrics.Impressions > 0
                ? (double)(metrics.Likes + metrics.Comments + metrics.Reposts) / metrics.Impressions
                : 0;

            return new AnalyzePostPerformanceResponseDto
            {
                Metrics = metrics,
                RawSources = sources
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing post performance for {PostId}", postId);
            throw;
        }
    }

    private async Task FetchMetricsFromSqlAsync(
        string postId,
        PostPerformanceMetricsDto metrics,
        PostPerformanceRawSourcesDto sources)
    {
        // Query the DB for actual counts
        var post = await _dbContext.Posts
            .AsNoTracking()
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .FirstOrDefaultAsync(p => p.IdPost == postId);

        if (post == null)
        {
            throw new KeyNotFoundException($"Post '{postId}' not found.");
        }

        metrics.Likes = post.Likes?.Count ?? 0;
        metrics.Comments = post.Comments?.Count ?? 0;
        metrics.Reposts = post.Reposts?.Count ?? 0;
        metrics.Impressions = 0; // SQL fallback for impressions (tracked via Redis)

        sources.Likes = new PostPerformanceSourceDto { Value = metrics.Likes, Source = "sql" };
        sources.Comments = new PostPerformanceSourceDto { Value = metrics.Comments, Source = "sql" };
        sources.Reposts = new PostPerformanceSourceDto { Value = metrics.Reposts, Source = "sql" };
        sources.Impressions = new PostPerformanceSourceDto { Value = metrics.Impressions, Source = "sql" };
    }
}
