using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Posts;

namespace InteractHub_API.Services;

public interface IPostService
{
    Task<List<Post>> GetPostsAsync(DateTime? lastTimestamp, int limit);

    Task<Post> GetPostByIdAsync(string postId);

    Task<Post> CreatePostAsync(string userId, CreatePostRequestDto request);

    Task DeletePostAsync(string postId);

    Task<Post> RepostAsync(string userId, string parentPostId, string? content);
}

