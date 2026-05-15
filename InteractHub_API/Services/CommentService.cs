using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Services;

public class CommentService : ICommentService
{
    private readonly AppDbContext _dbContext;

    public CommentService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Comment> CreateCommentAsync(string userId, string postId, string content)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
        }

        var post = await _dbContext.Posts.FindAsync(postId)
            ?? throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");

        var comment = new Comment
        {
            IdTaiKhoan = userId,
            IdPost = postId,
            Content = content?.Trim()
        };

        _dbContext.Comments.Add(comment);
        await _dbContext.SaveChangesAsync();

        return comment;
    }

    public async Task<Comment> RecommentAsync(string userId, string postId, string parentCommentId, string content)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
        }

        var parent = await _dbContext.Comments
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdComment == parentCommentId)
            ?? throw new KeyNotFoundException($"Không tìm thấy bình luận cha '{parentCommentId}'.");

        if (parent.ParentCommentId is not null)
        {
            throw new InvalidOperationException("Không thể reply vào một reply (chỉ 1 cấp được cho phép). ");
        }

        if (!string.Equals(parent.IdPost, postId, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Bình luận cha không thuộc bài viết được chỉ định.");
        }

        var reply = new Comment
        {
            IdTaiKhoan = userId,
            IdPost = postId,
            ParentCommentId = parentCommentId,
            Content = content?.Trim()
        };

        _dbContext.Comments.Add(reply);
        await _dbContext.SaveChangesAsync();

        return reply;
    }

    public async Task<IReadOnlyList<Comment>> GetCommentsByPostAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        var postExists = await _dbContext.Posts.AnyAsync(p => p.IdPost == postId);
        if (!postExists)
        {
            throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");
        }

        return await _dbContext.Comments
            .AsNoTracking()
            .Where(c => c.IdPost == postId)
            .Include(c => c.TaiKhoan)
            .Include(c => c.Replies)
                .ThenInclude(r => r.TaiKhoan)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
    }
}

