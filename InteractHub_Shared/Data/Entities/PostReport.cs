namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho một báo cáo nội dung vi phạm trên bài viết.
/// Maps to table: PostReport
/// </summary>
public class PostReport
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdReport { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser (người gửi báo cáo)</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>Khóa ngoại trỏ đến Post (bài viết bị báo cáo)</summary>
    public string? IdPost { get; set; }

    /// <summary>Nội dung / lý do báo cáo</summary>
    public string? NoiDung { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người dùng gửi báo cáo</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Bài viết bị báo cáo</summary>
    public Post? Post { get; set; }
}