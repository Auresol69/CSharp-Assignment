namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một story (tin) của người dùng (tự xóa sau 24 giờ).
/// Maps to table: Story
/// </summary>
public class Story
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdStory { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>Ngày đăng story</summary>
    public DateOnly? Ngay { get; set; }

    /// <summary>
    /// Trạng thái hiển thị của story.
    /// Ví dụ: "Active" | "Expired"
    /// </summary>
    public string? TrangThai { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Chủ sở hữu story</summary>
    public ApplicationUser? TaiKhoan { get; set; }
}
