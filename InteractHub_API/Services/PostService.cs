using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Posts;
using InteractHub_API.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace InteractHub_API.Services;

// sealed: không cho class nào kế thừa
public sealed class PostService : IPostService
{
    private readonly AppDbContext _dbContext;
    private readonly IMediaService _mediaService;
    private readonly InteractHub_API.Data.Repositories.IPostRepository _postRepository;
    private readonly IHashtagService _hashtagService;
    private readonly IAdvancedGraphService _graphService;
    private readonly ILogger<PostService> _logger;

    public PostService(
        AppDbContext dbContext,
        IMediaService mediaService,
        InteractHub_API.Data.Repositories.IPostRepository postRepository,
        IHashtagService hashtagService,
        IAdvancedGraphService graphService,
        ILogger<PostService> logger)
    {
        _dbContext = dbContext;
        _mediaService = mediaService;
        _postRepository = postRepository;
        _hashtagService = hashtagService;
        _graphService = graphService;
        _logger = logger;
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

        // Extract and link hashtags
        var hashtags = new List<string>();
        if (!string.IsNullOrWhiteSpace(post.Content))
        {
            await ExtractAndLinkHashtagsAsync(post.IdPost, post.Content);
            hashtags = ExtractHashtagsFromContent(post.Content);
        }

        // Re-fetch with relations for response
        var createdPost = await _dbContext.Posts
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .FirstOrDefaultAsync(p => p.IdPost == post.IdPost)
            ?? throw new KeyNotFoundException($"Không tìm thấy post vừa tạo '{post.IdPost}'.");

        // Sync sang Neo4j (fire-and-forget với error handling)
        _ = Task.Run(async () =>
        {
            try
            {
                await _graphService.SyncPostNodeAsync(post.IdPost, userId);
                if (hashtags.Count > 0)
                {
                    await _graphService.SyncHashtagsForPostAsync(post.IdPost, hashtags);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Neo4j sync thất bại cho Post '{PostId}'", post.IdPost);
            }
        });

        return createdPost;
    }

    public async Task<Post> GetPostByIdAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        return await _dbContext.Posts
            .AsNoTracking()
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Reposts)
            .Include(p => p.Comments)
                .ThenInclude(c => c.TaiKhoan)
            .Include(p => p.Comments)
                .ThenInclude(c => c.Replies)
                    .ThenInclude(r => r.TaiKhoan)
            .FirstOrDefaultAsync(p => p.IdPost == postId)
            ?? throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");
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

        // Extract and link hashtags
        var repostHashtags = new List<string>();
        if (!string.IsNullOrWhiteSpace(repost.Content))
        {
            await ExtractAndLinkHashtagsAsync(repost.IdPost, repost.Content);
            repostHashtags = ExtractHashtagsFromContent(repost.Content);
        }

        // Re-fetch with relations for response
        var createdRepost = await _dbContext.Posts
            .Include(p => p.PostMedias)
            .Include(p => p.TaiKhoan)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Include(p => p.Reposts)
            .Include(p => p.ParentPost)
                .ThenInclude(parent => parent.PostMedias)
            .Include(p => p.ParentPost)
                .ThenInclude(parent => parent.TaiKhoan)
            .FirstOrDefaultAsync(p => p.IdPost == repost.IdPost)
            ?? throw new KeyNotFoundException($"Không tìm thấy repost vừa tạo '{repost.IdPost}'.");

        // Sync sang Neo4j (fire-and-forget với error handling)
        _ = Task.Run(async () =>
        {
            try
            {
                await _graphService.SyncPostNodeAsync(repost.IdPost, userId);
                if (repostHashtags.Count > 0)
                {
                    await _graphService.SyncHashtagsForPostAsync(repost.IdPost, repostHashtags);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Neo4j sync thất bại cho Repost '{PostId}'", repost.IdPost);
            }
        });

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

    private async Task ExtractAndLinkHashtagsAsync(string postId, string content)
    {
        var hashtags = ExtractHashtagsFromContent(content);
        if (hashtags.Count == 0)
        {
            return;
        }

        var postHashtags = new List<PostHashtag>();
        foreach (var hashtagContent in hashtags)
        {
            try
            {
                var hashtagId = await _hashtagService.GetOrCreateHashtagAsync(hashtagContent);
                postHashtags.Add(new PostHashtag
                {
                    IdPost = postId,
                    IdHashtag = hashtagId
                });

                // Increment trending score
                await _hashtagService.IncrementHashtagAsync(hashtagContent);
            }
            catch (Exception ex)
            {
                // Log error but continue processing other hashtags
                System.Diagnostics.Debug.WriteLine($"Error processing hashtag '{hashtagContent}': {ex.Message}");
            }
        }

        if (postHashtags.Count > 0)
        {
            _dbContext.PostHashtags.AddRange(postHashtags);
            await _dbContext.SaveChangesAsync();
        }
    }

    private static List<string> ExtractHashtagsFromContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return [];
        }

        // Regex pattern: (?:^|\s)#([a-zA-Z0-9_]+)
        // Matches hashtags that are preceded by start of string or whitespace
        var pattern = @"(?:^|\s)#([a-zA-Z0-9_]+)";
        var matches = Regex.Matches(content, pattern, RegexOptions.IgnoreCase);

        var hashtags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (Match match in matches)
        {
            if (match.Groups.Count > 1)
            {
                var hashtagName = match.Groups[1].Value;
                if (!string.IsNullOrWhiteSpace(hashtagName))
                {
                    hashtags.Add(hashtagName);
                }
            }
        }

        return hashtags.ToList();
    }
}

