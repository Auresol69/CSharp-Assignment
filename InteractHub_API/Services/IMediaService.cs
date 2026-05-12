using InteractHub_Shared.DTOs.Media;

namespace InteractHub_API.Services;

public interface IMediaService
{
    Task<MediaUploadResultDto> UploadMediaAsync(IFormFile file, string folder);

    Task DeleteMediaAsync(string publicId);
}

