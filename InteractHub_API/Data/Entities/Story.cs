namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một story (tin) của người dùng, tự ẩn sau 24 giờ.
/// Mỗi story là một item độc lập, thường chỉ chứa 1 ảnh hoặc 1 video.
/// Maps to table: Story
/// </summary>
public class Story
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdStory { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>
    /// URL của media được đăng trong story.
    /// Story thường chỉ có một media chính.
    /// </summary>
    public string MediaUrl { get; set; } = string.Empty;

    /// <summary>
    /// Loại media của story: Image hoặc Video.
    /// </summary>
    public MediaType MediaType { get; set; }

    /// <summary>
    /// Caption ngắn đi kèm story.
    /// Không nên dài như post.
    /// </summary>
    public string? Caption { get; set; }

    /// <summary>
    /// Thời điểm đăng story (UTC).
    /// Dùng để tính thời hạn hiển thị 24 giờ.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời điểm story hết hạn (UTC).
    /// Giá trị mặc định là CreatedAt + 24 giờ.
    /// </summary>
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Chủ sở hữu story</summary>
    public ApplicationUser? TaiKhoan { get; set; }
}
