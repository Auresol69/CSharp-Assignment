using InteractHub_API.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Data;

/// <summary>
/// DbContext trung tâm của ứng dụng InteractHub.
/// Kế thừa IdentityDbContext&lt;ApplicationUser, IdentityRole, string&gt; để tích hợp
/// ASP.NET Core Identity với khóa kiểu string (GUID).
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    // ─────────────────────────── DbSets ───────────────────────────

    public DbSet<Post>         Posts         { get; set; } = null!;
    public DbSet<Comment>      Comments      { get; set; } = null!;
    public DbSet<Like>         Likes         { get; set; } = null!;
    public DbSet<Friendship>   Friendships   { get; set; } = null!;
    public DbSet<Story>        Stories       { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Hashtag>      Hashtags      { get; set; } = null!;
    public DbSet<PostHashtag>  PostHashtags  { get; set; } = null!;
    public DbSet<PostReport>   PostReports   { get; set; } = null!;
    public DbSet<PostMedia>    PostMedias    { get; set; } = null!;

    // ─────────────────────────── Constructor ───────────────────────────

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ─────────────────────────── Fluent API ───────────────────────────

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Bắt buộc gọi base để Identity tự cấu hình các bảng của nó
        base.OnModelCreating(builder);

        // ══════════════════════════════════════════════════════════════
        // IDENTITY – Đặt lại tên bảng cho khớp với schema
        // ══════════════════════════════════════════════════════════════
        builder.Entity<ApplicationUser>      ().ToTable("TaiKhoan");
        builder.Entity<IdentityRole>          ().ToTable("Roles");
        builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");

        // ══════════════════════════════════════════════════════════════
        // 1. ApplicationUser (TaiKhoan)
        // ══════════════════════════════════════════════════════════════
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.TenTaiKhoan)
                  .HasMaxLength(100);
        });

        // ══════════════════════════════════════════════════════════════
        // 2. Post
        //    - Bỏ Tag; thêm Content (nvarchar(max))
        //    - Index Non-Clustered trên IdTaiKhoan (FK)
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Post>(entity =>
        {
            entity.ToTable("Post");
            entity.HasKey(p => p.IdPost);

            entity.Property(p => p.IdPost)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            // Content lưu văn bản dài → nvarchar(max)
            entity.Property(p => p.Content)
                  .HasColumnType("nvarchar(max)");

            // ── Quan hệ: Post (n) → ApplicationUser (1) ──
            entity.HasOne(p => p.TaiKhoan)
                  .WithMany(u => u.Posts)
                  .HasForeignKey(p => p.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);

            // ── Non-Clustered Index trên FK ──
            entity.HasIndex(p => p.IdTaiKhoan)
                  .HasDatabaseName("IX_Post_IdTaiKhoan");
        });

        // ══════════════════════════════════════════════════════════════
        // 3. Comment
        //    - Index Non-Clustered trên IdTaiKhoan, IdPost
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Comment>(entity =>
        {
            entity.ToTable("Comment");
            entity.HasKey(c => c.IdComment);

            entity.Property(c => c.IdComment)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            // ── Quan hệ: Comment (n) → ApplicationUser (1) ──
            entity.HasOne(c => c.TaiKhoan)
                  .WithMany(u => u.Comments)
                  .HasForeignKey(c => c.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);

            // ── Quan hệ: Comment (n) → Post (1) ──
            entity.HasOne(c => c.Post)
                  .WithMany(p => p.Comments)
                  .HasForeignKey(c => c.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Non-Clustered Indexes trên các FK ──
            entity.HasIndex(c => c.IdTaiKhoan)
                  .HasDatabaseName("IX_Comment_IdTaiKhoan");

            entity.HasIndex(c => c.IdPost)
                  .HasDatabaseName("IX_Comment_IdPost");
        });

        // ══════════════════════════════════════════════════════════════
        // 4. Like
        //    - Composite PK (IdTaiKhoan + IdPost) đảm bảo 1 like/user/post
        //    - Bỏ SoLuong
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Like>(entity =>
        {
            entity.ToTable("Like");

            // Composite Primary Key – tự đã tạo index Clustered
            entity.HasKey(l => new { l.IdTaiKhoan, l.IdPost });

            entity.Property(l => l.IdTaiKhoan).HasMaxLength(450);
            entity.Property(l => l.IdPost).HasMaxLength(450);

            // ── Quan hệ: Like (n) → ApplicationUser (1) ──
            entity.HasOne(l => l.TaiKhoan)
                  .WithMany(u => u.Likes)
                  .HasForeignKey(l => l.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Quan hệ: Like (n) → Post (1) ──
            entity.HasOne(l => l.Post)
                  .WithMany(p => p.Likes)
                  .HasForeignKey(l => l.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Non-Clustered Index bổ sung theo chiều ngược lại ──
            entity.HasIndex(l => l.IdPost)
                  .HasDatabaseName("IX_Like_IdPost");
        });

        // ══════════════════════════════════════════════════════════════
        // 5. Friendship
        //    - Composite PK (IdNguoiGui + IdNguoiNhan)
        //    - Dùng Restrict để tránh multiple cascade paths
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Friendship>(entity =>
        {
            entity.ToTable("Friendship");

            entity.HasKey(f => new { f.IdNguoiGui, f.IdNguoiNhan });

            entity.Property(f => f.IdNguoiGui).HasMaxLength(450);
            entity.Property(f => f.IdNguoiNhan).HasMaxLength(450);

            entity.Property(f => f.TrangThai)
                  .HasMaxLength(450);

            // ── Quan hệ: Friendship → NguoiGui ──
            entity.HasOne(f => f.NguoiGui)
                  .WithMany(u => u.SentFriendships)
                  .HasForeignKey(f => f.IdNguoiGui)
                  .OnDelete(DeleteBehavior.Restrict);

            // ── Quan hệ: Friendship → NguoiNhan ──
            entity.HasOne(f => f.NguoiNhan)
                  .WithMany(u => u.ReceivedFriendships)
                  .HasForeignKey(f => f.IdNguoiNhan)
                  .OnDelete(DeleteBehavior.Restrict);

            // ── Non-Clustered Index theo NguoiNhan (truy vấn lời mời nhận được) ──
            entity.HasIndex(f => f.IdNguoiNhan)
                  .HasDatabaseName("IX_Friendship_IdNguoiNhan");
        });

        // ══════════════════════════════════════════════════════════════
        // 6. Story
        //    - CreatedAt kiểu datetime2 (DateTime trong C#)
        //    - Index Non-Clustered trên IdTaiKhoan
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Story>(entity =>
        {
            entity.ToTable("Story");
            entity.HasKey(s => s.IdStory);

            entity.Property(s => s.IdStory)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            // DateTime trong C# → datetime2 trong SQL Server
            entity.Property(s => s.CreatedAt)
                  .HasColumnType("datetime2")
                  .HasDefaultValueSql("SYSUTCDATETIME()"); // UTC tự động

            entity.Property(s => s.TrangThai)
                  .HasMaxLength(50);

            // ── Quan hệ: Story (n) → ApplicationUser (1) ──
            entity.HasOne(s => s.TaiKhoan)
                  .WithMany(u => u.Stories)
                  .HasForeignKey(s => s.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);

            // ── Non-Clustered Index + filter để query story còn Active hiệu quả ──
            entity.HasIndex(s => s.IdTaiKhoan)
                  .HasDatabaseName("IX_Story_IdTaiKhoan");

            entity.HasIndex(s => s.CreatedAt)
                  .HasDatabaseName("IX_Story_CreatedAt");
        });

        // ══════════════════════════════════════════════════════════════
        // 7. Notification
        //    - Thêm TriggeredByUserId (FK người gây ra thông báo)
        //    - Thêm IsRead (bool, default false)
        //    - Dùng Restrict cho TriggeredByUser để tránh multiple cascade paths
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notification");
            entity.HasKey(n => n.IdNotification);

            entity.Property(n => n.IdNotification)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            entity.Property(n => n.Type)
                  .HasMaxLength(50);

            entity.Property(n => n.IsRead)
                  .HasDefaultValue(false);

            entity.Property(n => n.TriggeredByUserId)
                  .HasMaxLength(450);

            // ── Quan hệ: Notification (n) → Người nhận (1) ──
            entity.HasOne(n => n.TaiKhoan)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Quan hệ: Notification (n) → Người trigger (1) ──
            entity.HasOne(n => n.TriggeredByUser)
                  .WithMany(u => u.TriggeredNotifications)
                  .HasForeignKey(n => n.TriggeredByUserId)
                  .OnDelete(DeleteBehavior.Restrict); // Tránh multiple cascade

            // ── Quan hệ: Notification (n) → Post (1) ──
            entity.HasOne(n => n.Post)
                  .WithMany(p => p.Notifications)
                  .HasForeignKey(n => n.IdPost)
                  .OnDelete(DeleteBehavior.SetNull);

            // ── Non-Clustered Indexes ──
            entity.HasIndex(n => n.IdTaiKhoan)
                  .HasDatabaseName("IX_Notification_IdTaiKhoan");

            entity.HasIndex(n => n.TriggeredByUserId)
                  .HasDatabaseName("IX_Notification_TriggeredByUserId");

            entity.HasIndex(n => n.IdPost)
                  .HasDatabaseName("IX_Notification_IdPost");

            // Index composite để query "thông báo chưa đọc của user X" rất nhanh
            entity.HasIndex(n => new { n.IdTaiKhoan, n.IsRead })
                  .HasDatabaseName("IX_Notification_IdTaiKhoan_IsRead");
        });

        // ══════════════════════════════════════════════════════════════
        // 8. Hashtag
        //    - Unique index trên NoiDung (tên hashtag không trùng)
        // ══════════════════════════════════════════════════════════════
        builder.Entity<Hashtag>(entity =>
        {
            entity.ToTable("Hashtag");
            entity.HasKey(h => h.IdHashtag);

            entity.Property(h => h.IdHashtag)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            entity.Property(h => h.NoiDung)
                  .HasMaxLength(100);

            entity.HasIndex(h => h.NoiDung)
                  .IsUnique()
                  .HasDatabaseName("UX_Hashtag_NoiDung");
        });

        // ══════════════════════════════════════════════════════════════
        // 9. PostHashtag (bảng trung gian n-n: Post ↔ Hashtag)
        //    - Composite PK (IdPost + IdHashtag)
        // ══════════════════════════════════════════════════════════════
        builder.Entity<PostHashtag>(entity =>
        {
            entity.ToTable("PostHashtag");

            entity.HasKey(ph => new { ph.IdPost, ph.IdHashtag });

            entity.Property(ph => ph.IdPost).HasMaxLength(450);
            entity.Property(ph => ph.IdHashtag).HasMaxLength(450);

            // ── Quan hệ: PostHashtag (n) → Post (1) ──
            entity.HasOne(ph => ph.Post)
                  .WithMany(p => p.PostHashtags)
                  .HasForeignKey(ph => ph.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Quan hệ: PostHashtag (n) → Hashtag (1) ──
            entity.HasOne(ph => ph.Hashtag)
                  .WithMany(h => h.PostHashtags)
                  .HasForeignKey(ph => ph.IdHashtag)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Non-Clustered Index theo chiều ngược (query: hashtag này có bài nào?) ──
            entity.HasIndex(ph => ph.IdHashtag)
                  .HasDatabaseName("IX_PostHashtag_IdHashtag");
        });

        // ══════════════════════════════════════════════════════════════
        // 10. PostReport
        //     - Index Non-Clustered trên IdTaiKhoan, IdPost
        // ══════════════════════════════════════════════════════════════
        builder.Entity<PostReport>(entity =>
        {
            entity.ToTable("PostReport");
            entity.HasKey(r => r.IdReport);

            entity.Property(r => r.IdReport)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            entity.Property(r => r.NoiDung)
                  .HasMaxLength(255);

            // ── Quan hệ: PostReport (n) → ApplicationUser (1) ──
            entity.HasOne(r => r.TaiKhoan)
                  .WithMany(u => u.PostReports)
                  .HasForeignKey(r => r.IdTaiKhoan)
                  .OnDelete(DeleteBehavior.SetNull);

            // ── Quan hệ: PostReport (n) → Post (1) ──
            entity.HasOne(r => r.Post)
                  .WithMany(p => p.PostReports)
                  .HasForeignKey(r => r.IdPost)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Non-Clustered Indexes ──
            entity.HasIndex(r => r.IdTaiKhoan)
                  .HasDatabaseName("IX_PostReport_IdTaiKhoan");

            entity.HasIndex(r => r.IdPost)
                  .HasDatabaseName("IX_PostReport_IdPost");
        });

        // ══════════════════════════════════════════════════════════════
        // 11. PostMedia (MỚI)
        //     - Id (string GUID), PostId (FK), Url, MediaType (enum → string)
        //     - Index Non-Clustered trên PostId
        // ══════════════════════════════════════════════════════════════
        builder.Entity<PostMedia>(entity =>
        {
            entity.ToTable("PostMedia");
            entity.HasKey(m => m.Id);

            entity.Property(m => m.Id)
                  .HasMaxLength(450)
                  .ValueGeneratedNever();

            entity.Property(m => m.PostId)
                  .HasMaxLength(450)
                  .IsRequired();

            entity.Property(m => m.Url)
                  .HasMaxLength(2048) // URL độ dài tiêu chuẩn
                  .IsRequired();

            // Lưu enum dưới dạng string ("Image" / "Video") thay vì int
            // → dễ đọc trong DB, không bị lỗi khi thêm giá trị enum mới
            entity.Property(m => m.MediaType)
                  .HasConversion<string>()
                  .HasMaxLength(10);

            // ── Quan hệ: PostMedia (n) → Post (1) ──
            entity.HasOne(m => m.Post)
                  .WithMany(p => p.PostMedias)
                  .HasForeignKey(m => m.PostId)
                  .OnDelete(DeleteBehavior.Cascade);

            // ── Non-Clustered Index trên FK ──
            entity.HasIndex(m => m.PostId)
                  .HasDatabaseName("IX_PostMedia_PostId");
        });
    }
}
