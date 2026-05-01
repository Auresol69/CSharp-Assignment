using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Media;

namespace InteractHub_API.Services;

public sealed class CloudinaryService : IMediaService
{
    private const long DefaultMaxUploadBytes = 10 * 1024 * 1024;

    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;
    private readonly long _maxUploadBytes;

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _logger = logger;

        // Ưu tiên đọc từ environment variables (từ .env), nếu không có thì lấy từ appsettings
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME")
            ?? configuration.GetSection("Cloudinary")["CloudName"]
            ?? throw new InvalidOperationException("Cloudinary:CloudName (CLOUDINARY_CLOUD_NAME) chưa được cấu hình.");

        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY")
            ?? configuration.GetSection("Cloudinary")["ApiKey"]
            ?? throw new InvalidOperationException("Cloudinary:ApiKey (CLOUDINARY_API_KEY) chưa được cấu hình.");

        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
            ?? configuration.GetSection("Cloudinary")["ApiSecret"]
            ?? throw new InvalidOperationException("Cloudinary:ApiSecret (CLOUDINARY_API_SECRET) chưa được cấu hình.");

        var maxUploadBytesStr = Environment.GetEnvironmentVariable("CLOUDINARY_MAX_UPLOAD_BYTES")
            ?? configuration.GetSection("Cloudinary")["MaxUploadBytes"];

        _maxUploadBytes = long.TryParse(maxUploadBytesStr, out var bytes) ? bytes : DefaultMaxUploadBytes;

        _cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));
        _cloudinary.Api.Secure = true;
    }

    public async Task<MediaUploadResultDto> UploadMediaAsync(IFormFile file, string folder)
    {
        var mediaType = ValidateAndDetectMediaType(file);

        await using var stream = file.OpenReadStream();

        if (mediaType == MediaType.Video)
        {
            var videoUploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                Transformation = BuildTransformation(folder, mediaType)
            };

            var videoUploadResult = await _cloudinary.UploadAsync(videoUploadParams);
            return BuildUploadResponse(videoUploadResult);
        }

        var imageUploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            Transformation = BuildTransformation(folder, mediaType)
        };

        var imageUploadResult = await _cloudinary.UploadAsync(imageUploadParams);
        return BuildUploadResponse(imageUploadResult);
    }

    private static MediaUploadResultDto BuildUploadResponse(RawUploadResult uploadResult)
    {
        if (uploadResult.Error is not null)
        {
            throw new InvalidOperationException($"Cloudinary upload thất bại: {uploadResult.Error.Message}");
        }

        var url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString();
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new InvalidOperationException("Cloudinary không trả về URL hợp lệ.");
        }

        return new MediaUploadResultDto(uploadResult.PublicId, url);
    }

    public async Task DeleteMediaAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
        {
            throw new InvalidOperationException("PublicId không được để trống.");
        }

        var deleteResult = await _cloudinary.DestroyAsync(new DeletionParams(publicId));

        if (deleteResult.Error is not null)
        {
            throw new InvalidOperationException($"Cloudinary delete thất bại: {deleteResult.Error.Message}");
        }

        if (!string.Equals(deleteResult.Result, "ok", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(deleteResult.Result, "not found", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Cloudinary trả về trạng thái xóa không kỳ vọng cho {PublicId}: {Result}", publicId, deleteResult.Result);
        }
    }

    private MediaType ValidateAndDetectMediaType(IFormFile file)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("File tải lên không được rỗng.");
        }

        if (file.Length > _maxUploadBytes)
        {
            throw new InvalidOperationException($"File vượt quá giới hạn {_maxUploadBytes / (1024 * 1024)} MB.");
        }

        var contentType = (file.ContentType ?? string.Empty).Trim();
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return MediaType.Image;
        }

        if (contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
            || string.Equals(contentType, "application/mp4", StringComparison.OrdinalIgnoreCase))
        {
            return MediaType.Video;
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (IsImageExtension(extension))
        {
            return MediaType.Image;
        }

        if (IsVideoExtension(extension))
        {
            return MediaType.Video;
        }

        throw new InvalidOperationException(
            $"Chỉ chấp nhận file ảnh hoặc video. Content-Type='{contentType}', FileName='{file.FileName}'."
        );
    }

    private static bool IsImageExtension(string extension)
    {
        return extension is ".jpg" or ".jpeg" or ".png" or ".gif" or ".bmp" or ".webp";
    }

    private static bool IsVideoExtension(string extension)
    {
        return extension is ".mp4" or ".mov" or ".avi" or ".wmv" or ".mkv" or ".webm" or ".m4v";
    }

    private static Transformation BuildTransformation(string folder, MediaType mediaType)
    {
        if (folder.Contains("story", StringComparison.OrdinalIgnoreCase))
        {
            var storyTransformation = new Transformation()
                .Height(1920)
                .Width(1080)
                .Crop("fill");

            return mediaType == MediaType.Video
                ? storyTransformation.Quality("auto")
                : storyTransformation;
        }

        var postTransformation = new Transformation()
            .Width(1600)
            .Height(1600)
            .Crop("limit");

        return mediaType == MediaType.Video
            ? postTransformation.Quality("auto")
            : postTransformation;
    }
}
