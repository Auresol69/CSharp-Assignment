using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace InteractHub_API.Data.Repositories;

public class PostRepository : IPostRepository
{
    private const string BlacklistedPostsKey = "blacklisted_posts";

    private readonly AppDbContext _dbContext;
    private readonly IConnectionMultiplexer _redis;

    public PostRepository(AppDbContext dbContext, IConnectionMultiplexer redis)
    {
        _dbContext = dbContext;
        _redis = redis;
    }

    public async Task<List<Post>> GetPostsAsync(DateTime? lastTimestamp, int limit)
    {
        // If lastTimestamp is null or default, use now
        var cursor = (!lastTimestamp.HasValue || lastTimestamp == default) ? DateTime.UtcNow : lastTimestamp.Value;
        var blacklistedPosts = await _redis.GetDatabase().SetMembersAsync(BlacklistedPostsKey);
        var blacklistedPostIds = blacklistedPosts.Select(value => value.ToString()).ToArray();

        var query = _dbContext.Posts
            .AsNoTracking()
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .Include(p => p.ParentPost)
                .ThenInclude(parent => parent.PostMedias)
            .Include(p => p.ParentPost)
                .ThenInclude(parent => parent.TaiKhoan)
            .Where(p => p.CreatedAt < cursor);

        if (blacklistedPostIds.Length > 0)
        {
            query = query.Where(p => !blacklistedPostIds.Contains(p.IdPost));
        }

        query = query
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit);

        return await query.ToListAsync();
    }
}

