using System.Globalization;
using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using StackExchange.Redis;
using Microsoft.EntityFrameworkCore;

public class HashtagService : IHashtagService
{
    private const string DailyKeyPrefix = "trending:daily";
    private const string WeeklyKeyPrefix = "trending:weekly";
    private const string MonthlyKeyPrefix = "trending:monthly";

    private static readonly TimeSpan DailyTtl = TimeSpan.FromDays(3);
    private static readonly TimeSpan WeeklyTtl = TimeSpan.FromDays(14);
    private static readonly TimeSpan MonthlyTtl = TimeSpan.FromDays(60);

    private readonly IDatabase _redis;
    private readonly AppDbContext _dbContext;

    public HashtagService(IConnectionMultiplexer redis, AppDbContext dbContext)
    {
        _redis = redis.GetDatabase();
        _dbContext = dbContext;
    }

    public async Task<List<string>> GetTrendingHashtagsAsync(int take = 10)
    {
        return await GetTopHashtagsAsync("daily", take);
    }

    public async Task<List<string>> GetTopHashtagsAsync(string filterType, int take = 10)
    {
        var key = ResolveKey(filterType, DateTime.UtcNow);
        var result = await _redis.SortedSetRangeByRankAsync(key, 0, take - 1, Order.Descending);
        return result.Select(x => x.ToString()).ToList();
    }

    public async Task IncrementHashtagAsync(string hashtag)
    {
        if (string.IsNullOrWhiteSpace(hashtag))
        {
            throw new ArgumentException("Hashtag không hợp lệ.", nameof(hashtag));
        }

        var now = DateTime.UtcNow;
        var dailyKey = ResolveKey("daily", now);
        var weeklyKey = ResolveKey("weekly", now);
        var monthlyKey = ResolveKey("monthly", now);

        var dailyExistsTask = _redis.KeyExistsAsync(dailyKey);
        var weeklyExistsTask = _redis.KeyExistsAsync(weeklyKey);
        var monthlyExistsTask = _redis.KeyExistsAsync(monthlyKey);
        await Task.WhenAll(dailyExistsTask, weeklyExistsTask, monthlyExistsTask);

        var batch = _redis.CreateBatch();
        var incrementTasks = new[]
        {
            batch.SortedSetIncrementAsync(dailyKey, hashtag, 1),
            batch.SortedSetIncrementAsync(weeklyKey, hashtag, 1),
            batch.SortedSetIncrementAsync(monthlyKey, hashtag, 1)
        };

        var expireTasks = new List<Task>();
        if (!dailyExistsTask.Result)
        {
            expireTasks.Add(batch.KeyExpireAsync(dailyKey, DailyTtl));
        }

        if (!weeklyExistsTask.Result)
        {
            expireTasks.Add(batch.KeyExpireAsync(weeklyKey, WeeklyTtl));
        }

        if (!monthlyExistsTask.Result)
        {
            expireTasks.Add(batch.KeyExpireAsync(monthlyKey, MonthlyTtl));
        }

        batch.Execute();
        await Task.WhenAll(incrementTasks.Concat(expireTasks));
    }

    private static string ResolveKey(string filterType, DateTime utcNow)
    {
        return filterType.Trim().ToLowerInvariant() switch
        {
            "daily" => $"{DailyKeyPrefix}:{utcNow:yyyy-MM-dd}",
            "weekly" => $"{WeeklyKeyPrefix}:{utcNow:yyyy}-{ISOWeek.GetWeekOfYear(utcNow):D2}",
            "monthly" => $"{MonthlyKeyPrefix}:{utcNow:yyyy-MM}",
            _ => throw new ArgumentException("filterType chỉ chấp nhận: daily, weekly, monthly.", nameof(filterType))
        };
    }

    public async Task<string> GetOrCreateHashtagAsync(string hashtagContent)
    {
        if (string.IsNullOrWhiteSpace(hashtagContent))
        {
            throw new ArgumentException("Hashtag không hợp lệ.", nameof(hashtagContent));
        }

        var normalized = NormalizeHashtag(hashtagContent);
        var existing = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.NoiDung == normalized);

        if (existing != null)
        {
            return existing.IdHashtag;
        }

        var newHashtag = new Hashtag
        {
            IdHashtag = Guid.NewGuid().ToString(),
            NoiDung = normalized
        };

        _dbContext.Hashtags.Add(newHashtag);
        await _dbContext.SaveChangesAsync();
        return newHashtag.IdHashtag;
    }

    public async Task<IReadOnlyList<Post>> GetPostsByHashtagAsync(string hashtagContent, DateTime? lastTimestamp = null, int take = 10)
    {
        if (string.IsNullOrWhiteSpace(hashtagContent))
        {
            throw new ArgumentException("Hashtag không hợp lệ.", nameof(hashtagContent));
        }

        var normalized = NormalizeHashtag(hashtagContent);
        var hashtag = await _dbContext.Hashtags
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.NoiDung == normalized);

        if (hashtag == null)
        {
            return [];
        }

        var cursor = (!lastTimestamp.HasValue || lastTimestamp == default) ? DateTime.UtcNow : lastTimestamp.Value;
        var blacklistedPosts = await _redis.SetMembersAsync("blacklisted_posts");
        var blacklistedPostIds = blacklistedPosts.Select(value => value.ToString()).ToArray();

        var query = _dbContext.Posts
            .AsNoTracking()
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .Include(p => p.PostHashtags)
            .Where(p => p.CreatedAt < cursor && p.PostHashtags.Any(ph => ph.IdHashtag == hashtag.IdHashtag));

        if (blacklistedPostIds.Length > 0)
        {
            query = query.Where(p => !blacklistedPostIds.Contains(p.IdPost));
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(take)
            .ToListAsync();
    }

    private static string NormalizeHashtag(string hashtag)
    {
        return hashtag
            .Trim()
            .TrimStart('#')
            .ToLowerInvariant()
            .Trim();
    }
}