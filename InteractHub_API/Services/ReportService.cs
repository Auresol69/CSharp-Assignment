using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Notifications;
using InteractHub_Shared.DTOs.Moderation;
using InteractHub_Shared.Hubs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using InteractHub_Shared.Services;

namespace InteractHub_API.Services;

public sealed class ReportService : IReportService
{
    private const string BlacklistedPostsKey = "blacklisted_posts";
    private const int ReportThreshold = 5;

    private readonly AppDbContext _dbContext;
    private readonly IConnectionMultiplexer _redis;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPresenceService _presenceService;
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;
    private readonly ILogger<ReportService> _logger;

    public ReportService(
        AppDbContext dbContext,
        IConnectionMultiplexer redis,
        UserManager<ApplicationUser> userManager,
        IPresenceService presenceService,
        IHubContext<NotificationHub, INotificationClient> hubContext,
        ILogger<ReportService> logger)
    {
        _dbContext = dbContext;
        _redis = redis;
        _userManager = userManager;
        _presenceService = presenceService;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task ReportPostAsync(string postId, string reason, string reporterId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        if (string.IsNullOrWhiteSpace(reporterId))
        {
            throw new UnauthorizedAccessException("Không xác định được người báo cáo.");
        }

        var post = await _dbContext.Posts.FirstOrDefaultAsync(p => p.IdPost == postId)
            ?? throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");

        var report = new PostReport
        {
            IdReport = Guid.NewGuid().ToString(),
            IdPost = post.IdPost,
            IdTaiKhoan = reporterId,
            NoiDung = reason?.Trim()
        };

        _dbContext.PostReports.Add(report);
        await _dbContext.SaveChangesAsync();

        var reportCount = await _dbContext.PostReports.CountAsync(r => r.IdPost == postId);
        if (reportCount <= ReportThreshold)
        {
            return;
        }

        var wasAdded = await _redis.GetDatabase().SetAddAsync(BlacklistedPostsKey, postId);
        if (!wasAdded)
        {
            return;
        }

        await NotifyAdminsAsync(postId, reportCount, reporterId, reason);
    }

    public async Task<IReadOnlyList<ReportedPostSummaryDto>> GetReportedPostsAsync()
    {
        var blacklistedPostIds = await _redis.GetDatabase().SetMembersAsync(BlacklistedPostsKey);
        var blacklistedLookup = blacklistedPostIds
            .Select(value => value.ToString())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var reports = await _dbContext.PostReports
            .AsNoTracking()
            .Include(r => r.Post)
                .ThenInclude(p => p!.TaiKhoan)
            .ToListAsync();

        return reports
            .Where(r => r.Post != null)
            .GroupBy(r => r.IdPost)
            .Select(group => new ReportedPostSummaryDto
            {
                PostId = group.Key ?? string.Empty,
                Content = group.First().Post?.Content,
                AuthorId = group.First().Post?.IdTaiKhoan,
                AuthorName = group.First().Post?.TaiKhoan?.TenTaiKhoan,
                AuthorAvatarUrl = group.First().Post?.TaiKhoan?.AvatarUrl,
                ReportCount = group.Count(),
                IsBlacklisted = group.Key != null && blacklistedLookup.Contains(group.Key)
            })
            .OrderByDescending(item => item.ReportCount)
            .ThenByDescending(item => item.PostId)
            .ToList();
    }

    public async Task<IReadOnlyList<PostReportDetailDto>> GetReportsByPostAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        var postExists = await _dbContext.Posts.AnyAsync(p => p.IdPost == postId);
        if (!postExists)
        {
            throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");
        }

        var reports = await _dbContext.PostReports
            .AsNoTracking()
            .Where(r => r.IdPost == postId)
            .Include(r => r.TaiKhoan)
            .OrderBy(r => r.IdReport)
            .ToListAsync();

        return reports.Select(report => new PostReportDetailDto
        {
            ReportId = report.IdReport,
            PostId = report.IdPost,
            ReporterId = report.IdTaiKhoan,
            ReporterName = report.TaiKhoan?.TenTaiKhoan,
            ReporterAvatarUrl = report.TaiKhoan?.AvatarUrl,
            Reason = report.NoiDung
        }).ToList();
    }

    public async Task<bool> ApproveAndDeletePostAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        var post = await _dbContext.Posts.FirstOrDefaultAsync(p => p.IdPost == postId);
        if (post == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");
        }

        _dbContext.Posts.Remove(post);
        await _dbContext.SaveChangesAsync();

        await _redis.GetDatabase().SetRemoveAsync(BlacklistedPostsKey, postId);
        return true;
    }

    public async Task<bool> ClearReportsAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        var postExists = await _dbContext.Posts.AnyAsync(p => p.IdPost == postId);
        if (!postExists)
        {
            throw new KeyNotFoundException($"Không tìm thấy post '{postId}'.");
        }

        var reportsQuery = _dbContext.PostReports.Where(r => r.IdPost == postId);
        var hasReports = await reportsQuery.AnyAsync();
        if (hasReports)
        {
            _dbContext.PostReports.RemoveRange(reportsQuery);
            await _dbContext.SaveChangesAsync();
        }

        await _redis.GetDatabase().SetRemoveAsync(BlacklistedPostsKey, postId);
        return hasReports;
    }

    public async Task<bool> RemoveFromBlacklistAsync(string postId)
    {
        if (string.IsNullOrWhiteSpace(postId))
        {
            throw new ArgumentException("PostId không hợp lệ.", nameof(postId));
        }

        var removed = await _redis.GetDatabase().SetRemoveAsync(BlacklistedPostsKey, postId);
        return removed;
    }

    private async Task NotifyAdminsAsync(string postId, int reportCount, string reporterId, string? reason)
    {
        try
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count == 0)
            {
                return;
            }

            var reporter = await _userManager.FindByIdAsync(reporterId);
            var notification = new NotificationResponseDto
            {
                IdNotification = Guid.NewGuid().ToString(),
                IdPost = postId,
                Type = "PostBlacklisted",
                IsRead = false,
                TriggeredByUserName = reporter?.TenTaiKhoan,
                TriggeredByAvatarUrl = reporter?.AvatarUrl,
                Message = $"Bài viết {postId} đã bị đưa vào danh sách đen sau {reportCount} báo cáo{(string.IsNullOrWhiteSpace(reason) ? string.Empty : $": {reason.Trim()}")}."
            };

            foreach (var admin in admins)
            {
                var connections = await _presenceService.GetConnectionsAsync(admin.Id);
                if (connections.Length == 0)
                {
                    continue;
                }

                await _hubContext.Clients.Clients(connections).ReceiveNotification(notification);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error notifying admins for blacklisted post {PostId}", postId);
        }
    }
}
