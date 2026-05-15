using Microsoft.AspNetCore.Identity;

namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho tài khoản người dùng trong hệ thống.
/// Kế thừa IdentityUser (string key) để tích hợp đầy đủ ASP.NET Core Identity.
/// Maps to table: TaiKhoan
/// </summary>
public class ApplicationUser : IdentityUser
{
    // IdentityUser đã cung cấp sẵn: Id, UserName, Email, PhoneNumber, PasswordHash, v.v.

    /// <summary>Họ tên hiển thị của người dùng</summary>
    public string? TenTaiKhoan { get; set; }

    /// <summary>URL ảnh đại diện</summary>
    public string? AvatarUrl { get; set; }

    /// <summary>Tiểu sử</summary>
    public string? Bio { get; set; }

    /// <summary>Ngày sinh</summary>
    public DateTime? NgaySinh { get; set; }

    /// <summary>Giới tính</summary>
    public string? GioiTinh { get; set; }

    /// <summary>Địa chỉ</summary>
    public string? DiaChi { get; set; }

    /// <summary>Ngày tạo tài khoản</summary>
    public DateTime? CreatedAt { get; set; }

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

    /// <summary>Các thông báo mà người dùng NHẬN</summary>
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    /// <summary>Các thông báo mà hành động của người dùng GÂY RA (người trigger)</summary>
    public ICollection<Notification> TriggeredNotifications { get; set; } = new List<Notification>();

    /// <summary>Các báo cáo bài viết do người dùng gửi</summary>
    public ICollection<PostReport> PostReports { get; set; } = new List<PostReport>();
}