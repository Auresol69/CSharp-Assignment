namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một thông báo hệ thống gửi đến người dùng.
/// - Thêm TriggeredByUserId: người có hành động gây ra thông báo.
/// - Thêm IsRead: trạng thái đã đọc hay chưa.
/// Maps to table: Notification
/// </summary>
public class Notification
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdNotification { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser NHẬN thông báo</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>
    /// Khóa ngoại trỏ đến ApplicationUser GÂY RA thông báo.
    /// Ví dụ: người đã like / comment vào bài viết của bạn.
    /// </summary>
    public string? TriggeredByUserId { get; set; }

    /// <summary>Khóa ngoại trỏ đến Post liên quan (nullable)</summary>
    public string? IdPost { get; set; }

    /// <summary>
    /// Loại thông báo.
    /// Ví dụ: "Like" | "Comment" | "FriendRequest" | "Share"
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Trạng thái đã đọc hay chưa.
    /// Mặc định là false (chưa đọc).
    /// </summary>
    public bool IsRead { get; set; } = false;

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người nhận thông báo</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Người có hành động gây ra thông báo</summary>
    public ApplicationUser? TriggeredByUser { get; set; }

    /// <summary>Bài viết liên quan</summary>
    public Post? Post { get; set; }
}
