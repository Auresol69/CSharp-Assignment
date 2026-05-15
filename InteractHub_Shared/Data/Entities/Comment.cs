namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho một bình luận trên bài viết.
/// Hỗ trợ Recomment (Reply) qua quan hệ tự tham chiếu 1-N (ParentCommentId).
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

    /// <summary>
    /// Khóa ngoại tự tham chiếu dùng cho Recomment (Reply).
    /// - Null: đây là bình luận gốc (Top-level Comment) trực tiếp trên Post.
    /// - Có giá trị: đây là reply, trỏ đến bình luận cha.
    ///
    /// Giới hạn 1 cấp: Service layer phải kiểm tra ParentComment.ParentCommentId == null
    /// trước khi cho phép Recomment, ngăn lồng nhau nhiều tầng (nested replies).
    /// </summary>
    public string? ParentCommentId { get; set; }

    /// <summary>Nội dung bình luận</summary>
    public string? Content { get; set; }

    /// <summary>
    /// Thời điểm bình luận (datetime2, UTC).
    /// Thay thế cho cặp Ngay + Gio cũ.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Người đã bình luận</summary>
    public ApplicationUser? TaiKhoan { get; set; }

    /// <summary>Bài viết được bình luận</summary>
    public Post? Post { get; set; }

    /// <summary>
    /// Bình luận cha (chỉ có giá trị khi đây là Reply).
    /// Navigation của quan hệ tự tham chiếu.
    /// </summary>
    public Comment? ParentComment { get; set; }

    /// <summary>
    /// Danh sách các reply (Recomment) của bình luận này.
    /// Chỉ 1 cấp — ParentComment của các item này sẽ là bình luận hiện tại.
    /// </summary>
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
}