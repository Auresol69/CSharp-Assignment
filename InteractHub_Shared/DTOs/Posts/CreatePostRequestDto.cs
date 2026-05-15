using Microsoft.AspNetCore.Http;

namespace InteractHub_Shared.DTOs.Posts;

public sealed class CreatePostRequestDto
{
    public string? Content { get; set; }

    public IFormFile? MediaFile { get; set; }
}

