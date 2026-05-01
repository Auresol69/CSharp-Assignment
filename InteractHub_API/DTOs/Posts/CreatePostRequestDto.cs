namespace InteractHub_API.DTOs.Posts;

public sealed class CreatePostRequestDto
{
    public string? Content { get; set; }

    public IFormFile? MediaFile { get; set; }
}
