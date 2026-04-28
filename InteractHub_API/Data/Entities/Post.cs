namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một bài viết trong hệ thống.
/// - Loại bỏ Tag (logic hashtag chuyển sang PostHashtag).
/// - Thêm Content để lưu nội dung văn bản.
/// Maps to table: Post
/// </summary>
public class Post
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdPost { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser (tác giả)</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>Nội dung văn bản của bài viết (nvarchar(max))</summary>
    public string? Content { get; set; }

    /// <summary>Ngày đăng bài</summary>
    public DateOnly? Ngay { get; set; }

    /// <summary>Giờ đăng bài</summary>
    public TimeOnly? Gio { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Tác giả bài viết</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Danh sách bình luận</summary>
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    /// <summary>Danh sách lượt thích</summary>
    public ICollection<Like> Likes { get; set; } = new List<Like>();

    /// <summary>Danh sách thông báo liên quan</summary>
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    /// <summary>Danh sách báo cáo bài viết</summary>
    public ICollection<PostReport> PostReports { get; set; } = new List<PostReport>();

    /// <summary>Danh sách hashtag (n-n qua PostHashtag)</summary>
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();

    /// <summary>Danh sách tệp đa phương tiện đính kèm (ảnh, video)</summary>
    public ICollection<PostMedia> PostMedias { get; set; } = new List<PostMedia>();
}
