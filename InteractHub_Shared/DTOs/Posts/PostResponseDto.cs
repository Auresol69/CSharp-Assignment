namespace InteractHub_Shared.DTOs.Posts;

public class PostResponseDto
{
    public string IdPost { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ParentPostId { get; set; }

    // ThÃ´ng tin ngÆ°á»i Ä‘Äƒng bÃ i
    public UserResponseDto? TaiKhoan { get; set; }

    // Danh sÃ¡ch media (Url + loáº¡i: Image hoáº·c Video)
    public List<PostMediaDto> Media { get; set; } = new();
    // Bài viết gốc (khi là repost)
    public PostResponseDto? ParentPost { get; set; }
    // Counts
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public int RepostsCount { get; set; }
}
