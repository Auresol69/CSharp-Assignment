using InteractHub_API.Data.Entities;

namespace InteractHub_API.Services;

public interface ICommentService
{
    Task<Comment> CreateCommentAsync(string userId, string postId, string content);

    Task<Comment> RecommentAsync(string userId, string postId, string parentCommentId, string content);

    Task<IReadOnlyList<Comment>> GetCommentsByPostAsync(string postId);
}
