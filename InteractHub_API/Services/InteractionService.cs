using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Interactions;

namespace InteractHub_API.Services;

public class InteractionService : IInteractionService
{
    private readonly AppDbContext _context;
    public InteractionService(AppDbContext context)
    {
         _context = context;
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
        return new InteractionResponseDto 
        { 
            isSuccess = true,
            Message = "Liked"
        };
    }
}
