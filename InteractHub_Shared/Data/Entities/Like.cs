namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho lượt thích của người dùng trên một bài viết.
/// - Loại bỏ SoLuong: mỗi người chỉ Like 1 lần, đảm bảo bởi Composite PK.
/// - Composite PK: (IdTaiKhoan + IdPost).
/// Maps to table: Like
/// </summary>
public class Like
{
    /// <summary>Khóa ngoại trỏ đến ApplicationUser (phần 1 của Composite PK)</summary>
    public string IdTaiKhoan { get; set; } = string.Empty;

    /// <summary>Khóa ngoại trỏ đến Post (phần 2 của Composite PK)</summary>
    public string IdPost { get; set; } = string.Empty;

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người dùng đã thích</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Bài viết được thích</summary>
    public Post? Post { get; set; }
}