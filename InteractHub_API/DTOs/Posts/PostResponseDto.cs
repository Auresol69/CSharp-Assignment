namespace InteractHub_API.DTOs.Posts;

public class PostResponseDto
{
    public string IdPost { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ParentPostId { get; set; }

    // Thông tin người đăng bài
    public UserResponseDto? TaiKhoan { get; set; }

    // Danh sách media (Url + loại: Image hoặc Video)
    public List<PostMediaDto> Media { get; set; } = new();

    // Counts
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public int RepostsCount { get; set; }
}