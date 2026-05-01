using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Posts;

namespace InteractHub_API.Services;

public interface IPostService
{
    Task<Post> CreatePostAsync(string userId, CreatePostRequestDto request);

    Task DeletePostAsync(string postId);
}
