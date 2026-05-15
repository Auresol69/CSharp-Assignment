using InteractHub_Shared.DTOs.Interactions;

namespace InteractHub_Shared.DTOs.Posts;

public class PostDetailResponseDto
{
    public string IdPost { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ParentPostId { get; set; }
    public UserResponseDto? TaiKhoan { get; set; }
    public List<PostMediaDto> Media { get; set; } = new();
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public int RepostsCount { get; set; }
    public List<CommentResponseDto> Comments { get; set; } = new();
}
