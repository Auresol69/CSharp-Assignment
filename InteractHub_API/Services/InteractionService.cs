using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Interactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace InteractHub_API.Services;

public class InteractionService : IInteractionService
{
    private readonly AppDbContext _context;
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<InteractionService> _logger;

    public InteractionService(AppDbContext context, IConnectionMultiplexer redis, ILogger<InteractionService> logger)
    {
        _context = context;
        _redis = redis;
        _logger = logger;
    }

    public async Task<InteractionResponseDto> CommentAsync(CommentRequest request)
    {
        var newComment = new Comment
        {
            IdComment = Guid.NewGuid().ToString(),
            IdTaiKhoan = request.IdTaiKhoan,
            IdPost = request.IdPost,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };
        _context.Comments.Add(newComment);
        await _context.SaveChangesAsync();

        // Push event vào Redis Stream để Worker xử lý notification
        var post = await _context.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.IdPost == request.IdPost);
        if (post?.IdTaiKhoan != null && post.IdTaiKhoan != request.IdTaiKhoan)
        {
            try
            {
                var db = _redis.GetDatabase();
                await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
                {
                    new("toUserId", post.IdTaiKhoan),
                    new("senderId", request.IdTaiKhoan),
                    new("postId", request.IdPost),
                    new("notificationType", "Comment"),
                });

                _logger.LogInformation("Event Comment pushed to Redis Stream for post owner {PostOwnerId}.", post.IdTaiKhoan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pushing Comment event to Redis Stream.");
            }
        }

        return new InteractionResponseDto
        {
            isSuccess = true,
            Message = "Sent"
        };
    }

    public async Task<InteractionResponseDto> LikeAsync(LikeRequest request)
    {
        var newLike = new Like
        {
            IdTaiKhoan = request.IdTaiKhoan,
            IdPost = request.IdPost
        };
        _context.Likes.Add(newLike);
        await _context.SaveChangesAsync();

        // Push event vào Redis Stream để Worker xử lý notification
        var post = await _context.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.IdPost == request.IdPost);
        if (post?.IdTaiKhoan != null && post.IdTaiKhoan != request.IdTaiKhoan)
        {
            try
            {
                var db = _redis.GetDatabase();
                await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
                {
                    new("toUserId", post.IdTaiKhoan),
                    new("senderId", request.IdTaiKhoan),
                    new("postId", request.IdPost),
                    new("notificationType", "Like"),
                });

                _logger.LogInformation("Event Like pushed to Redis Stream for post owner {PostOwnerId}.", post.IdTaiKhoan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pushing Like event to Redis Stream.");
            }
        }

        return new InteractionResponseDto
        {
            isSuccess = true,
            Message = "Liked"
        };
    }
}

