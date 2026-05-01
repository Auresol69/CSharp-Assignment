using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Stories;
using InteractHub_API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Services;

public sealed class StoryService : IStoryService
{
    private readonly AppDbContext _dbContext;
    private readonly IMediaService _mediaService;

    public StoryService(AppDbContext dbContext, IMediaService mediaService)
    {
        _dbContext = dbContext;
        _mediaService = mediaService;
    }

    public async Task<Story> CreateStoryAsync(string userId, CreateStoryRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
        }

        if (request.MediaFile is null || request.MediaFile.Length <= 0)
        {
            throw new InvalidOperationException("Story phải có file media hợp lệ.");
        }

        var story = new Story
        {
            IdTaiKhoan = userId,
            Caption = request.Caption?.Trim(),
            MediaType = DetectMediaType(request.MediaFile)
        };

        var uploadResult = await _mediaService.UploadMediaAsync(request.MediaFile, $"stories/{story.IdStory}");
        story.MediaUrl = uploadResult.Url;

        _dbContext.Stories.Add(story);
        await _dbContext.SaveChangesAsync();

        return story;
    }

    public async Task DeleteStoryAsync(string storyId)
    {
        var story = await _dbContext.Stories
            .FirstOrDefaultAsync(s => s.IdStory == storyId)
            ?? throw new KeyNotFoundException($"Không tìm thấy story '{storyId}'.");

        if (CloudinaryUrlHelper.TryGetPublicIdFromUrl(story.MediaUrl, out var publicId))
        {
            await _mediaService.DeleteMediaAsync(publicId);
        }

        _dbContext.Stories.Remove(story);
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
