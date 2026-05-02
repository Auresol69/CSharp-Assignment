using InteractHub_API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Data.Repositories;

public class PostRepository : IPostRepository
{
    private readonly AppDbContext _dbContext;

    public PostRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Post>> GetPostsAsync(DateTime? lastTimestamp, int limit)
    {
        // If lastTimestamp is null or default, use now
        var cursor = (!lastTimestamp.HasValue || lastTimestamp == default) ? DateTime.UtcNow : lastTimestamp.Value;

        var query = _dbContext.Posts
            .AsNoTracking()
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .Where(p => p.CreatedAt < cursor)
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit);

        return await query.ToListAsync();
    }
}
