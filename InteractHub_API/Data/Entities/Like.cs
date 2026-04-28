namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho lượt thích của một người dùng trên một bài viết.
/// Khóa chính là khóa composite (IdTaiKhoan + IdPost).
/// Maps to table: Like
/// </summary>
public class Like
{
    /// <summary>Khóa ngoại trỏ đến ApplicationUser (phần 1 của composite PK)</summary>
    public string IdTaiKhoan { get; set; } = string.Empty;

    /// <summary>Khóa ngoại trỏ đến Post (phần 2 của composite PK)</summary>
    public string IdPost { get; set; } = string.Empty;

    /// <summary>Số lượt thích (mặc định 1 theo schema SQL)</summary>
    public int SoLuong { get; set; } = 1;

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người dùng đã thích</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Bài viết được thích</summary>
    public Post? Post { get; set; }
}
