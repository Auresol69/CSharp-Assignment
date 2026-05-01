using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Posts;
using InteractHub_API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Services;

// sealed class thì không thể bị kế thừa bởi bất kỳ class nào khác
public sealed class PostService : IPostService
{
    private readonly AppDbContext _dbContext;
    private readonly IMediaService _mediaService;

    public PostService(AppDbContext dbContext, IMediaService mediaService)
    {
        _dbContext = dbContext;
        _mediaService = mediaService;
    }

    public async Task<Post> CreatePostAsync(string userId, CreatePostRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
        }

        var post = new Post
        {
            IdTaiKhoan = userId,
            Content = request.Content?.Trim()
        };

        if (request.MediaFile is not null)
        {
            var uploadResult = await _mediaService.UploadMediaAsync(request.MediaFile, $"posts/{post.IdPost}");
            post.PostMedias.Add(new PostMedia
            {
                Url = uploadResult.Url,
                MediaType = DetectMediaType(request.MediaFile)
            });
        }

        _dbContext.Posts.Add(post);
        await _dbContext.SaveChangesAsync();

        return post;
    }

    public async Task DeletePostAsync(string postId)
    {
        var post = await _dbContext.Posts
            .Include(p => p.PostMedias)
            .FirstOrDefaultAsync(p => p.IdPost == postId)
            ?? throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");

        foreach (var media in post.PostMedias)
        {
            if (CloudinaryUrlHelper.TryGetPublicIdFromUrl(media.Url, out var publicId))
            {
                await _mediaService.DeleteMediaAsync(publicId);
            }
        }

        _dbContext.PostMedias.RemoveRange(post.PostMedias);
        _dbContext.Posts.Remove(post);
        await _dbContext.SaveChangesAsync();
    }

    private static MediaType DetectMediaType(IFormFile file)
    {
        if (file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
            || string.Equals(file.ContentType, "application/mp4", StringComparison.OrdinalIgnoreCase))
        {
            return MediaType.Video;
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is ".mp4" or ".mov" or ".avi" or ".wmv" or ".mkv" or ".webm" or ".m4v")
        {
            return MediaType.Video;
        }

        return MediaType.Image;
    }
}
