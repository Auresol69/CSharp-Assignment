using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Interactions;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Services;

public class InteractionService : IInteractionService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public InteractionService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
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

        // Create and send notification to post owner
        var post = await _context.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.IdPost == request.IdPost);
        if (post?.IdTaiKhoan != null && post.IdTaiKhoan != request.IdTaiKhoan)
        {
            await _notificationService.CreateAndSendNotificationAsync(post.IdTaiKhoan, request.IdTaiKhoan, request.IdPost, "Comment");
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

        // Notify post owner
        var post = await _context.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.IdPost == request.IdPost);
        if (post?.IdTaiKhoan != null && post.IdTaiKhoan != request.IdTaiKhoan)
        {
            await _notificationService.CreateAndSendNotificationAsync(post.IdTaiKhoan, request.IdTaiKhoan, request.IdPost, "Like");
        }
        return new InteractionResponseDto
        {
            isSuccess = true,
            Message = "Liked"
        };
    }
}
