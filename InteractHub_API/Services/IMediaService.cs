using InteractHub_API.DTOs.Media;

namespace InteractHub_API.Services;

public interface IMediaService
{
    Task<MediaUploadResultDto> UploadMediaAsync(IFormFile file, string folder);

    Task<MediaUploadResultDto> UploadImageAsync(IFormFile file);

    Task DeleteMediaAsync(string publicId);
}
