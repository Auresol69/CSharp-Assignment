namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một story (tin) của người dùng, tự ẩn sau 24 giờ.
/// - Đổi Ngay (DateOnly) → CreatedAt (DateTime / datetime2) để tính chính xác thời hạn 24h.
/// Maps to table: Story
/// </summary>
public class Story
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdStory { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>
    /// Thời điểm đăng story (datetime2).
    /// Được dùng để kiểm tra xem story có còn trong 24h hay không.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Trạng thái hiển thị.
    /// Giá trị: "Active" | "Expired"
    /// </summary>
    public string? TrangThai { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Chủ sở hữu story</summary>
    public ApplicationUser? TaiKhoan { get; set; }
}
