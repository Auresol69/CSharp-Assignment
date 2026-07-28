using System.Globalization;
using InteractHub_API.Agents.DTOs;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

/// <inheritdoc />
public class GetTrendingTopicsSkill : IGetTrendingTopicsSkill
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<GetTrendingTopicsSkill> _logger;

    // Must match the key prefixes used by HashtagService
    private const string DailyKeyPrefix = "trending:daily";
    private const string WeeklyKeyPrefix = "trending:weekly";
    private const string MonthlyKeyPrefix = "trending:monthly";

    public GetTrendingTopicsSkill(
        IConnectionMultiplexer redis,
        ILogger<GetTrendingTopicsSkill> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<GetTrendingTopicsResponseDto> ExecuteAsync(string category = "global", int limit = 10)
    {
        // Normalize: "global" or empty → "daily" (most useful default)
        if (string.IsNullOrWhiteSpace(category) || category.Equals("global", StringComparison.OrdinalIgnoreCase))
        {
            category = "daily";
        }

        if (limit <= 0 || limit > 100)
        {
            limit = 10;
        }

        try
        {
            var db = _redis.GetDatabase();
            var trendingKey = ResolveKey(category, DateTime.UtcNow);

            _logger.LogInformation("Fetching trending topics from Redis key: '{Key}', limit: {Limit}", trendingKey, limit);

            // Fetch top `limit` items from the sorted set in descending order (highest score first)
            var topItems = await db.SortedSetRangeByRankAsync(
                trendingKey,
                0,
                limit - 1,
                Order.Descending);

            if (topItems.Length == 0)
            {
                _logger.LogInformation("No trending topics found for category '{Category}' (key: '{Key}') in Redis.", category, trendingKey);
                return new GetTrendingTopicsResponseDto { Topics = new() };
            }

            // Fetch scores for each item
            var topics = new List<TrendingTopicDto>();
            foreach (var item in topItems)
            {
                var score = await db.SortedSetScoreAsync(trendingKey, item);
                topics.Add(new TrendingTopicDto
                {
                    Topic = item.ToString(),
                    Score = score.HasValue ? score.Value : 0
                });
            }

            return new GetTrendingTopicsResponseDto { Topics = topics };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching trending topics for category '{Category}'", category);
            throw;
        }
    }

    /// <summary>
    /// Resolves the Redis key for trending data — must match HashtagService.ResolveKey exactly.
    /// </summary>
    private static string ResolveKey(string filterType, DateTime utcNow)
    {
        return filterType.Trim().ToLowerInvariant() switch
        {
            "daily" => $"{DailyKeyPrefix}:{utcNow:yyyy-MM-dd}",
            "weekly" => $"{WeeklyKeyPrefix}:{utcNow:yyyy}-{ISOWeek.GetWeekOfYear(utcNow):D2}",
            "monthly" => $"{MonthlyKeyPrefix}:{utcNow:yyyy-MM}",
            _ => $"{DailyKeyPrefix}:{utcNow:yyyy-MM-dd}" // fallback to daily
        };
    }
}
