using InteractHub_API.DTOs.Posts;

namespace InteractHub_API.DTOs.Interactions;

public class CommentResponseDto
{
    public string IdComment { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ParentCommentId { get; set; }
    public UserResponseDto? TaiKhoan { get; set; }
    public List<CommentResponseDto> Replies { get; set; } = new();
}