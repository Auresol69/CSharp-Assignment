using System.Globalization;
using InteractHub_API.Agents.DTOs;
using InteractHub_Shared.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

/// <inheritdoc />
public class GetTrendingTopicsSkill : IGetTrendingTopicsSkill
{
    private readonly IConnectionMultiplexer _redis;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<GetTrendingTopicsSkill> _logger;

    // Must match the key prefixes used by HashtagService
    private const string DailyKeyPrefix   = "trending:daily";
    private const string WeeklyKeyPrefix  = "trending:weekly";
    private const string MonthlyKeyPrefix = "trending:monthly";

    private const int DefaultLimit = 5;

    public GetTrendingTopicsSkill(
        IConnectionMultiplexer redis,
        AppDbContext dbContext,
        ILogger<GetTrendingTopicsSkill> logger)
    {
        _redis     = redis;
        _dbContext = dbContext;
        _logger    = logger;
    }

    public async Task<GetTrendingTopicsResponseDto> ExecuteAsync(string category = "global", int limit = 10)
    {
        // Normalize category
        if (string.IsNullOrWhiteSpace(category) || category.Equals("global", StringComparison.OrdinalIgnoreCase))
        {
            category = "daily";
        }

        // Clamp limit: invalid or zero falls back to the constant default
        if (limit <= 0 || limit > 100)
        {
            limit = DefaultLimit;
        }

        try
        {
            var db         = _redis.GetDatabase();
            var trendingKey = ResolveKey(category, DateTime.UtcNow);

            _logger.LogInformation(
                "Fetching trending topics from Redis key: '{Key}', limit: {Limit}", trendingKey, limit);

            // ── 1. Try Redis first ─────────────────────────────────────────────
            var topItems = await db.SortedSetRangeByRankAsync(
                trendingKey,
                0,
                limit - 1,
                Order.Descending);

            if (topItems.Length > 0)
            {
                var topics = new List<TrendingTopicDto>(topItems.Length);
                foreach (var item in topItems)
                {
                    var score = await db.SortedSetScoreAsync(trendingKey, item);
                    topics.Add(new TrendingTopicDto
                    {
                        Topic  = item.ToString(),
                        Score  = score ?? 0,
                        Source = "redis"
                    });
                }

                return new GetTrendingTopicsResponseDto { Topics = topics };
            }

            // ── 2. Redis miss → SQL fallback ───────────────────────────────────
            _logger.LogInformation(
                "Redis key '{Key}' returned no results for category '{Category}'. Falling back to SQL (limit={Limit}).",
                trendingKey, category, limit);

            return await FetchFromSqlAsync(limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching trending topics for category '{Category}'", category);
            throw;
        }
    }

    // ── SQL fallback ──────────────────────────────────────────────────────────

    /// <summary>
    /// Queries PostHashtag JOIN Hashtag and groups by hashtag content,
    /// ordering by the number of posts that used each hashtag descending.
    /// Score here equals the usage count (number of posts).
    /// </summary>
    private async Task<GetTrendingTopicsResponseDto> FetchFromSqlAsync(int limit)
    {
        var results = await _dbContext.PostHashtags
            .AsNoTracking()
            .GroupBy(ph => ph.Hashtag!.NoiDung)
            .Select(g => new
            {
                Topic = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(limit)
            .ToListAsync();

        _logger.LogInformation(
            "SQL fallback returned {Count} trending topics.", results.Count);

        var topics = results.Select(r => new TrendingTopicDto
        {
            Topic  = r.Topic,
            Score  = r.Count,   // post usage count as the score proxy
            Source = "sql"
        }).ToList();

        return new GetTrendingTopicsResponseDto { Topics = topics };
    }

    // ── Key resolver ──────────────────────────────────────────────────────────

    /// <summary>
    /// Resolves the Redis key for trending data — must match HashtagService.ResolveKey exactly.
    /// </summary>
    private static string ResolveKey(string filterType, DateTime utcNow)
    {
        return filterType.Trim().ToLowerInvariant() switch
        {
            "daily"   => $"{DailyKeyPrefix}:{utcNow:yyyy-MM-dd}",
            "weekly"  => $"{WeeklyKeyPrefix}:{utcNow:yyyy}-{ISOWeek.GetWeekOfYear(utcNow):D2}",
            "monthly" => $"{MonthlyKeyPrefix}:{utcNow:yyyy-MM}",
            _         => $"{DailyKeyPrefix}:{utcNow:yyyy-MM-dd}" // fallback to daily
        };
    }
}
