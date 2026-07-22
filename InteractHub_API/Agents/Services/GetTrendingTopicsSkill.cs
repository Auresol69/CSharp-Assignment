using InteractHub_API.Agents.DTOs;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

/// <inheritdoc />
public class GetTrendingTopicsSkill : IGetTrendingTopicsSkill
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<GetTrendingTopicsSkill> _logger;

    public GetTrendingTopicsSkill(
        IConnectionMultiplexer redis,
        ILogger<GetTrendingTopicsSkill> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<GetTrendingTopicsResponseDto> ExecuteAsync(string category = "global", int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(category))
        {
            category = "global";
        }

        if (limit <= 0 || limit > 100)
        {
            limit = 10;
        }

        try
        {
            var db = _redis.GetDatabase();
            var trendingKey = $"trending:{category}";

            // Fetch top `limit` items from the sorted set in descending order (highest score first)
            var topItems = await db.SortedSetRangeByRankAsync(
                trendingKey,
                0,
                limit - 1,
                Order.Descending);

            if (topItems.Length == 0)
            {
                _logger.LogInformation("No trending topics found for category '{Category}' in Redis.", category);
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
}
