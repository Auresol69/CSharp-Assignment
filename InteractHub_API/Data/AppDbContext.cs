using InteractHub_API.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Data;

/// <summary>
/// DbContext trung tâm của ứng dụng InteractHub.
/// Kế thừa IdentityDbContext&lt;ApplicationUser&gt; để tích hợp đầy đủ
/// ASP.NET Core Identity (Users, Roles, Claims, Tokens…) với khóa kiểu string (GUID).
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    // ──────────────────────────── DbSets ────────────────────────────

    /// <summary>Bảng Post (bài viết)</summary>
    public DbSet<Post> Posts { get; set; } = null!;

    /// <summary>Bảng Comment (bình luận)</summary>
    public DbSet<Comment> Comments { get; set; } = null!;

    /// <summary>Bảng Like (lượt thích)</summary>
    public DbSet<Like> Likes { get; set; } = null!;

    /// <summary>Bảng Friendship (quan hệ bạn bè)</summary>
    public DbSet<Friendship> Friendships { get; set; } = null!;

    /// <summary>Bảng Story (tin / story)</summary>
    public DbSet<Story> Stories { get; set; } = null!;

    /// <summary>Bảng Notification (thông báo)</summary>
    public DbSet<Notification> Notifications { get; set; } = null!;

    /// <summary>Bảng Hashtag</summary>
    public DbSet<Hashtag> Hashtags { get; set; } = null!;

    /// <summary>Bảng trung gian PostHashtag (n-n: Post – Hashtag)</summary>
    public DbSet<PostHashtag> PostHashtags { get; set; } = null!;

    /// <summary>Bảng PostReport (báo cáo bài viết)</summary>
    public DbSet<PostReport> PostReports { get; set; } = null!;

    // ──────────────────────────── Constructor ────────────────────────────

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ──────────────────────────── Fluent API ────────────────────────────

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Gọi base để Identity tự cấu hình các bảng của nó
        base.OnModelCreating(builder);

        // ════════════════════════════════════════════════════════
        // 1. ApplicationUser (TaiKhoan)
        // ════════════════════════════════════════════════════════
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("TaiKhoan");

            entity.Property(u => u.TenTaiKhoan)
                  .HasMaxLength(100)
                  .IsRequired(false);

            entity.Property(u => u.SoDienThoai)
                  .HasMaxLength(15)
                  .IsRequired(false);
        });

        // ════════════════════════════════════════════════════════
        // 2. Post – ApplicationUser (n:1)
        //    Một User có nhiều Post; một Post thuộc về một User.
        // ════════════════════════════════════════════════════════
        builder.Entity<Post>(entity =>
        {
            entity.ToTable("Post");

            entity.HasKey(p => p.IdPost);

            entity.Property(p => p.IdPost)
                  .HasMaxLength(36)
                  .ValueGeneratedNever(); // GUID được gán từ ứng dụng

            entity.Property(p => p.Tag)
                  .HasMaxLength(255);

            // Quan hệ: Post (n) → ApplicationUser (1)
            entity.HasOne(p => p.TaiKhoan)
                  .WithMany(u => u.Posts)
                  .HasForeignKey(p => p.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull); // Khi user bị xóa, bài viết không bị mất
        });

        // ════════════════════════════════════════════════════════
        // 3. Comment – ApplicationUser (n:1) và Comment – Post (n:1)
        // ════════════════════════════════════════════════════════
        builder.Entity<Comment>(entity =>
        {
            entity.ToTable("Comment");

            entity.HasKey(c => c.IdComment);

            entity.Property(c => c.IdComment)
                  .HasMaxLength(36)
                  .ValueGeneratedNever();

            // Quan hệ: Comment (n) → ApplicationUser (1)
            entity.HasOne(c => c.TaiKhoan)
                  .WithMany(u => u.Comments)
                  .HasForeignKey(c => c.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);

            // Quan hệ: Comment (n) → Post (1)
            entity.HasOne(c => c.Post)
                  .WithMany(p => p.Comments)
                  .HasForeignKey(c => c.IdPost)
                  .OnDelete(DeleteBehavior.Cascade); // Xóa bài viết → xóa tất cả comment
        });

        // ════════════════════════════════════════════════════════
        // 4. Like – composite PK (IdTaiKhoan + IdPost)
        //    Quan hệ n:1 với User và Post
        // ════════════════════════════════════════════════════════
        builder.Entity<Like>(entity =>
        {
            entity.ToTable("Like");

            // Composite Primary Key
            entity.HasKey(l => new { l.IdTaiKhoan, l.IdPost });

            entity.Property(l => l.IdTaiKhoan).HasMaxLength(36);
            entity.Property(l => l.IdPost).HasMaxLength(36);

            entity.Property(l => l.SoLuong)
                  .HasDefaultValue(1);

            // Quan hệ: Like (n) → ApplicationUser (1)
            entity.HasOne(l => l.TaiKhoan)
                  .WithMany(u => u.Likes)
                  .HasForeignKey(l => l.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ: Like (n) → Post (1)
            entity.HasOne(l => l.Post)
                  .WithMany(p => p.Likes)
                  .HasForeignKey(l => l.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ════════════════════════════════════════════════════════
        // 5. Friendship – composite PK (IdNguoiGui + IdNguoiNhan)
        //    Hai quan hệ n:1 với ApplicationUser (tự tham chiếu)
        // ════════════════════════════════════════════════════════
        builder.Entity<Friendship>(entity =>
        {
            entity.ToTable("Friendship");

            // Composite Primary Key
            entity.HasKey(f => new { f.IdNguoiGui, f.IdNguoiNhan });

            entity.Property(f => f.IdNguoiGui).HasMaxLength(36);
            entity.Property(f => f.IdNguoiNhan).HasMaxLength(36);

            entity.Property(f => f.TrangThai)
                  .HasMaxLength(50);

            // Quan hệ: Friendship (n) → ApplicationUser (NguoiGui)
            entity.HasOne(f => f.NguoiGui)
                  .WithMany(u => u.SentFriendships)
                  .HasForeignKey(f => f.IdNguoiGui)
                  .OnDelete(DeleteBehavior.Restrict); // Tránh multiple cascade paths

            // Quan hệ: Friendship (n) → ApplicationUser (NguoiNhan)
            entity.HasOne(f => f.NguoiNhan)
                  .WithMany(u => u.ReceivedFriendships)
                  .HasForeignKey(f => f.IdNguoiNhan)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ════════════════════════════════════════════════════════
        // 6. Story – ApplicationUser (n:1)
        // ════════════════════════════════════════════════════════
        builder.Entity<Story>(entity =>
        {
            entity.ToTable("Story");

            entity.HasKey(s => s.IdStory);

            entity.Property(s => s.IdStory)
                  .HasMaxLength(36)
                  .ValueGeneratedNever();

            entity.Property(s => s.TrangThai)
                  .HasMaxLength(50);

            // Quan hệ: Story (n) → ApplicationUser (1)
            entity.HasOne(s => s.TaiKhoan)
                  .WithMany(u => u.Stories)
                  .HasForeignKey(s => s.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ════════════════════════════════════════════════════════
        // 7. Notification – ApplicationUser (n:1) và Post (n:1)
        // ════════════════════════════════════════════════════════
        builder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notification");

            entity.HasKey(n => n.IdNotification);

            entity.Property(n => n.IdNotification)
                  .HasMaxLength(36)
                  .ValueGeneratedNever();

            entity.Property(n => n.Type)
                  .HasMaxLength(50);

            // Quan hệ: Notification (n) → ApplicationUser (1)
            entity.HasOne(n => n.TaiKhoan)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ: Notification (n) → Post (1)
            entity.HasOne(n => n.Post)
                  .WithMany(p => p.Notifications)
                  .HasForeignKey(n => n.IdPost)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ════════════════════════════════════════════════════════
        // 8. Hashtag
        // ════════════════════════════════════════════════════════
        builder.Entity<Hashtag>(entity =>
        {
            entity.ToTable("Hashtag");

            entity.HasKey(h => h.IdHashtag);

            entity.Property(h => h.IdHashtag)
                  .HasMaxLength(36)
                  .ValueGeneratedNever();

            entity.Property(h => h.NoiDung)
                  .HasMaxLength(100);

            // Index để tìm kiếm hashtag nhanh hơn
            entity.HasIndex(h => h.NoiDung)
                  .IsUnique();
        });

        // ════════════════════════════════════════════════════════
        // 9. PostHashtag – bảng trung gian n:n (Post ↔ Hashtag)
        //    Composite PK (IdPost + IdHashtag)
        // ════════════════════════════════════════════════════════
        builder.Entity<PostHashtag>(entity =>
        {
            entity.ToTable("PostHashtag");

            // Composite Primary Key
            entity.HasKey(ph => new { ph.IdPost, ph.IdHashtag });

            entity.Property(ph => ph.IdPost).HasMaxLength(36);
            entity.Property(ph => ph.IdHashtag).HasMaxLength(36);

            // Quan hệ: PostHashtag (n) → Post (1)
            entity.HasOne(ph => ph.Post)
                  .WithMany(p => p.PostHashtags)
                  .HasForeignKey(ph => ph.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ: PostHashtag (n) → Hashtag (1)
            entity.HasOne(ph => ph.Hashtag)
                  .WithMany(h => h.PostHashtags)
                  .HasForeignKey(ph => ph.IdHashtag)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ════════════════════════════════════════════════════════
        // 10. PostReport – ApplicationUser (n:1) và Post (n:1)
        // ════════════════════════════════════════════════════════
        builder.Entity<PostReport>(entity =>
        {
            entity.ToTable("PostReport");

            entity.HasKey(r => r.IdReport);

            entity.Property(r => r.IdReport)
                  .HasMaxLength(36)
                  .ValueGeneratedNever();

            entity.Property(r => r.NoiDung)
                  .HasMaxLength(255);

            // Quan hệ: PostReport (n) → ApplicationUser (1)
            entity.HasOne(r => r.TaiKhoan)
                  .WithMany(u => u.PostReports)
                  .HasForeignKey(r => r.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);

            // Quan hệ: PostReport (n) → Post (1)
            entity.HasOne(r => r.Post)
                  .WithMany(p => p.PostReports)
                  .HasForeignKey(r => r.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ════════════════════════════════════════════════════════
        // 11. Identity – đổi tên bảng cho gọn (tùy chọn)
        // ════════════════════════════════════════════════════════
        builder.Entity<IdentityRole>().ToTable("Roles");
        builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
    }
}
