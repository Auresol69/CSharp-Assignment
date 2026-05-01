namespace InteractHub_API.DTOs.Stories;

public sealed class CreateStoryRequestDto
{
    public string? Caption { get; set; }

    public IFormFile MediaFile { get; set; } = default!;
}
