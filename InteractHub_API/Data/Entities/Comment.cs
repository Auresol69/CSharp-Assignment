namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một bình luận trên bài viết.
/// Maps to table: Comment
/// </summary>
public class Comment
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdComment { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser (người bình luận)</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>Khóa ngoại trỏ đến Post</summary>
    public string? IdPost { get; set; }

    /// <summary>Ngày bình luận</summary>
    public DateOnly? Ngay { get; set; }

    /// <summary>Giờ bình luận</summary>
    public TimeOnly? Gio { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người đã bình luận</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Bài viết được bình luận</summary>
    public Post? Post { get; set; }
}
