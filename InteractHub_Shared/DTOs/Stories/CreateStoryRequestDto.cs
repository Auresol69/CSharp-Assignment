using Microsoft.AspNetCore.Http;

namespace InteractHub_Shared.DTOs.Stories;

public sealed class CreateStoryRequestDto
{
    public string? Caption { get; set; }

    public IFormFile MediaFile { get; set; } = default!;
}

