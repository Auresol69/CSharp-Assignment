using InteractHub_API.Data;
using InteractHub_API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Services;

/// <summary>
/// Background Service tự động dọn dẹp các Story hết hạn (ExpiresAt &lt; UtcNow).
///
/// Thiết kế:
/// - Kế thừa <see cref="BackgroundService"/> — vòng lặp chạy trên IHostedService.
/// - Dùng <see cref="IServiceScopeFactory"/> để tạo Scope riêng mỗi lần quét,
///   tránh lỗi "Cannot use a scoped service from a singleton" với AppDbContext.
/// - Dùng <c>ExecuteDeleteAsync</c> (EF Core 7+) để xóa Batch một câu SQL duy nhất,
///   không cần load entity vào bộ nhớ — rất hiệu quả khi số bản ghi lớn.
/// - Bọc trong try-catch để Background Job không bị chết khi gặp lỗi tạm thời.
/// - Chu kỳ quét: mỗi 1 giờ (cấu hình qua CleanupIntervalHours trong appsettings).
/// </summary>
public sealed class StoryCleanupService : BackgroundService
{
    // ─────────────────────────── Dependencies ───────────────────────────

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<StoryCleanupService> _logger;
    private readonly TimeSpan _interval;

    // ─────────────────────────── Constructor ───────────────────────────

    public StoryCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<StoryCleanupService> logger,
        IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        // Đọc chu kỳ từ appsettings; mặc định 1 giờ nếu chưa cấu hình
        var hours = configuration.GetValue<double>("StoryCleanup:IntervalHours", defaultValue: 1.0);
        _interval = TimeSpan.FromHours(hours);
    }

    // ─────────────────────────── Vòng lặp chính ───────────────────────────

    /// <summary>
    /// Vòng lặp chạy vô hạn đến khi ứng dụng shutdown.
    /// Mỗi vòng: đợi <see cref="_interval"/>, sau đó thực hiện một lần quét xóa.
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "[StoryCleanup] Background service khởi động. Chu kỳ quét: {Interval}.",
            _interval);

        // Delay ngắn khi app vừa khởi động để DB connection pool sẵn sàng
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await RunCleanupAsync(stoppingToken);

            // Chờ đủ chu kỳ trước khi quét tiếp.
            // Task.Delay với stoppingToken sẽ thoát ngay khi app shutdown.
            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("[StoryCleanup] Background service đã dừng.");
    }

    // ─────────────────────────── Logic dọn dẹp ───────────────────────────

    /// <summary>
    /// Tạo một Scope, resolve AppDbContext, rồi thực thi Batch Delete.
    /// Toàn bộ được bọc trong try-catch để giữ service sống khi có lỗi.
    /// </summary>
    private async Task RunCleanupAsync(CancellationToken stoppingToken)
    {
        _logger.LogDebug("[StoryCleanup] Bắt đầu quét story hết hạn lúc {Time} (UTC).",
            DateTime.UtcNow);

        try
        {
            // ── Tạo Scope mới để resolve Scoped service (AppDbContext) ──────────
            // BackgroundService là Singleton, nên KHÔNG được inject DbContext trực tiếp.
            await using var scope = _scopeFactory.CreateAsyncScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var mediaService = scope.ServiceProvider.GetRequiredService<IMediaService>();

            var cutoff = DateTime.UtcNow;

            var expiredStories = await dbContext.Stories
                .Where(s => s.ExpiresAt < cutoff)
                .ToListAsync(stoppingToken);

            foreach (var story in expiredStories)
            {
                if (CloudinaryUrlHelper.TryGetPublicIdFromUrl(story.MediaUrl, out var publicId))
                {
                    try
                    {
                        await mediaService.DeleteMediaAsync(publicId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex,
                            "[StoryCleanup] Không xóa được media Cloudinary của story {StoryId}.",
                            story.IdStory);
                    }
                }
            }

            // ── Batch Delete — một câu SQL duy nhất, không load entity vào RAM ──
            // Tương đương: DELETE FROM Story WHERE ExpiresAt < @cutoff
            dbContext.Stories.RemoveRange(expiredStories);
            int deletedCount = await dbContext.SaveChangesAsync(stoppingToken);

            if (deletedCount > 0)
                _logger.LogInformation(
                    "[StoryCleanup] Đã xóa {Count} story hết hạn (cutoff = {Cutoff} UTC).",
                    deletedCount, cutoff);
            else
                _logger.LogDebug(
                    "[StoryCleanup] Không có story nào hết hạn tại {Cutoff} UTC.",
                    cutoff);
        }
        catch (OperationCanceledException)
        {
            // App đang shutdown — thoát vòng lặp, không log error
            _logger.LogInformation("[StoryCleanup] Quét bị hủy do ứng dụng đang shutdown.");
        }
        catch (Exception ex)
        {
            // Lỗi DB tạm thời (timeout, network…) — LOG rồi tiếp tục,
            // KHÔNG để exception làm chết toàn bộ Background Service.
            _logger.LogError(ex,
                "[StoryCleanup] Lỗi khi dọn dẹp story hết hạn. Service sẽ thử lại sau {Interval}.",
                _interval);
        }
    }
}
