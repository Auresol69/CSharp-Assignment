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
    private readonly InteractHub_API.Data.Repositories.IPostRepository _postRepository;

    public PostService(AppDbContext dbContext, IMediaService mediaService, InteractHub_API.Data.Repositories.IPostRepository postRepository)
    {
        _dbContext = dbContext;
        _mediaService = mediaService;
        _postRepository = postRepository;
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

        // Re-fetch with relations for response
        var createdPost = await _dbContext.Posts
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .FirstOrDefaultAsync(p => p.IdPost == post.IdPost)
            ?? throw new KeyNotFoundException($"Không tìm thấy post vừa tạo '{post.IdPost}'.");

        return createdPost;
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

    public async Task<Post> RepostAsync(string userId, string parentPostId, string? content)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
        }

        var parent = await _dbContext.Posts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdPost == parentPostId)
            ?? throw new KeyNotFoundException($"Không tìm thấy post '{parentPostId}'.");

        if (parent.ParentPostId is not null)
        {
            throw new InvalidOperationException("Không thể repost một repost.");
        }

        var repost = new Post
        {
            IdTaiKhoan = userId,
            ParentPostId = parentPostId,
            Content = content?.Trim()
        };

        _dbContext.Posts.Add(repost);
        await _dbContext.SaveChangesAsync();

        // Re-fetch with relations for response
        var createdRepost = await _dbContext.Posts
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .FirstOrDefaultAsync(p => p.IdPost == repost.IdPost)
            ?? throw new KeyNotFoundException($"Không tìm thấy repost vừa tạo '{repost.IdPost}'.");

        return createdRepost;
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

    public async Task<List<Post>> GetPostsAsync(DateTime? lastTimestamp, int limit)
    {
        return await _postRepository.GetPostsAsync(lastTimestamp, limit);
    }
}
