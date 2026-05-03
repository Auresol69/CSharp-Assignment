using StackExchange.Redis;

public class HashtagService : IHashtagService
{
    private readonly IDatabase _redis;
    private const string Key = "trending_hashtags";

    public HashtagService(IConnectionMultiplexer redis) => _redis = redis.GetDatabase();
    public async Task<List<string>> GetTrendingHashtagsAsync(int take = 10)
    {
        var result = await _redis.SortedSetRangeByRankAsync(Key, 0, take - 1, Order.Descending);
        return result.Select(x => x.ToString()).ToList();
    }

    public async Task IncrementHashtagAsync(string hashtag)
    {
        await _redis.SortedSetIncrementAsync(Key, hashtag, 1);
    }
}