using InteractHub_API.DTOs.Posts;

namespace InteractHub_API.DTOs.Stories;

public sealed class StoryResponseDto
{
    public string IdStory { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public string MediaUrl { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public UserResponseDto? TaiKhoan { get; set; }
}