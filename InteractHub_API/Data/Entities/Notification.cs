namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một thông báo hệ thống gửi đến người dùng.
/// Maps to table: Notification
/// </summary>
public class Notification
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdNotification { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser nhận thông báo</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>Khóa ngoại trỏ đến Post liên quan (có thể null nếu thông báo không liên quan đến bài viết)</summary>
    public string? IdPost { get; set; }

    /// <summary>
    /// Loại thông báo.
    /// Ví dụ: "Like" | "Comment" | "FriendRequest" | "Share"
    /// </summary>
    public string? Type { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người dùng nhận thông báo</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Bài viết liên quan đến thông báo</summary>
    public Post? Post { get; set; }
}
