namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho mối quan hệ bạn bè giữa hai người dùng.
/// Khóa chính là khóa composite (IdNguoiGui + IdNguoiNhan).
/// Maps to table: Friendship
/// </summary>
public class Friendship
{
    /// <summary>Khóa ngoại trỏ đến ApplicationUser – người GỬI yêu cầu kết bạn (phần 1 composite PK)</summary>
    public string IdNguoiGui { get; set; } = string.Empty;

    /// <summary>Khóa ngoại trỏ đến ApplicationUser – người NHẬN yêu cầu kết bạn (phần 2 composite PK)</summary>
    public string IdNguoiNhan { get; set; } = string.Empty;

    /// <summary>
    /// Trạng thái của mối quan hệ.
    /// Các giá trị hợp lệ: "Pending" | "Accepted" | "Blocked"
    /// </summary>
    public string? TrangThai { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người dùng đã gửi yêu cầu kết bạn</summary>
    public ApplicationUser? NguoiGui { get; set; }

    /// <summary>Người dùng nhận yêu cầu kết bạn</summary>
    public ApplicationUser? NguoiNhan { get; set; }
}
