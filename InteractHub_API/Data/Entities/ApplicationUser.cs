using Microsoft.AspNetCore.Identity;

namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho tài khoản người dùng trong hệ thống.
/// Kế thừa IdentityUser&lt;string&gt; để tích hợp ASP.NET Core Identity với khóa kiểu string (GUID).
/// Maps to table: TaiKhoan
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>Họ tên hiển thị của người dùng (TenTaiKhoan)</summary>
    public string? TenTaiKhoan { get; set; }

    /// <summary>Số điện thoại (SoDienThoai) - IdentityUser đã có PhoneNumber,
    /// nhưng giữ lại để khớp schema gốc</summary>
    public string? SoDienThoai { get; set; }

    // Email và MatKhau (PasswordHash) đã được IdentityUser quản lý

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Các bài viết của người dùng</summary>
    public ICollection<Post> Posts { get; set; } = new List<Post>();

    /// <summary>Các bình luận của người dùng</summary>
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    /// <summary>Các lượt thích của người dùng</summary>
    public ICollection<Like> Likes { get; set; } = new List<Like>();

    /// <summary>Các yêu cầu kết bạn mà người dùng đã GỬI</summary>
    public ICollection<Friendship> SentFriendships { get; set; } = new List<Friendship>();

    /// <summary>Các yêu cầu kết bạn mà người dùng đã NHẬN</summary>
    public ICollection<Friendship> ReceivedFriendships { get; set; } = new List<Friendship>();

    /// <summary>Các story của người dùng</summary>
    public ICollection<Story> Stories { get; set; } = new List<Story>();

    /// <summary>Các thông báo của người dùng</summary>
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    /// <summary>Các báo cáo bài viết do người dùng gửi</summary>
    public ICollection<PostReport> PostReports { get; set; } = new List<PostReport>();
}
