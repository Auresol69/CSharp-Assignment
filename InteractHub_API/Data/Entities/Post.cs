namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một bài viết trong hệ thống.
/// Maps to table: Post
/// </summary>
public class Post
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdPost { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>Ngày đăng bài</summary>
    public DateOnly? Ngay { get; set; }

    /// <summary>Giờ đăng bài</summary>
    public TimeOnly? Gio { get; set; }

    /// <summary>Tag / nội dung bài viết</summary>
    public string? Tag { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Tác giả bài viết</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Danh sách bình luận của bài viết</summary>
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    /// <summary>Danh sách lượt thích của bài viết</summary>
    public ICollection<Like> Likes { get; set; } = new List<Like>();

    /// <summary>Danh sách thông báo liên quan đến bài viết</summary>
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    /// <summary>Danh sách báo cáo bài viết</summary>
    public ICollection<PostReport> PostReports { get; set; } = new List<PostReport>();

    /// <summary>Danh sách hashtag (quan hệ n-n thông qua PostHashtag)</summary>
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
}
