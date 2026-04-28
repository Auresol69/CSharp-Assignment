namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một bài viết trong hệ thống.
/// Hỗ trợ Repost (Share) qua quan hệ tự tham chiếu 1-N (ParentPostId).
/// Maps to table: Post
/// </summary>
public class Post
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdPost { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến ApplicationUser (tác giả)</summary>
    public string? IdTaiKhoan { get; set; }

    /// <summary>
    /// Khóa ngoại tự tham chiếu dùng cho Repost/Share.
    /// - Null: đây là bài viết gốc (Original Post).
    /// - Có giá trị: đây là bài viết chia sẻ lại (Repost), trỏ đến bài viết cha.
    /// 
    /// Giới hạn 1 cấp: Service layer phải kiểm tra ParentPost.ParentPostId == null
    /// trước khi cho phép Repost, ngăn lồng nhau nhiều tầng.
    /// </summary>
    public string? ParentPostId { get; set; }

    /// <summary>Nội dung văn bản của bài viết (nvarchar(max))</summary>
    public string? Content { get; set; }

    /// <summary>
    /// Thời điểm đăng bài (datetime2, UTC).
    /// Thay thế cho cặp Ngay + Gio cũ.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Tác giả bài viết</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>
    /// Bài viết cha (chỉ có giá trị khi đây là Repost).
    /// Navigation của quan hệ tự tham chiếu.
    /// </summary>
    public Post? ParentPost { get; set; }

    /// <summary>
    /// Danh sách các bài viết con (Repost/Share bài viết này).
    /// Chỉ 1 cấp — ParentPost của các item này sẽ là bài viết hiện tại.
    /// </summary>
    public ICollection<Post> Reposts { get; set; } = new List<Post>();

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
