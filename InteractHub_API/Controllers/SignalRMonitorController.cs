using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Controllers;

// ─────────────────────────────────────────────────────────────────────────────
// Response DTOs
// ─────────────────────────────────────────────────────────────────────────────

public record ConnectionInfoDto(
    string UserId,
    string UserName,
    string? AvatarUrl,
    string[] ConnectionIds,
    int ConnectionCount,
    DateTime? LastSeenAt
);

public record SignalRStatsDto(
    int TotalOnlineUsers,
    int TotalConnections,
    DateTime GeneratedAt
);

public record SignalROverviewDto(
    SignalRStatsDto Stats,
    IReadOnlyList<ConnectionInfoDto> OnlineUsers
);

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/signalr")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class SignalRMonitorController : ControllerBase
{
    private readonly IPresenceService _presenceService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _db;
    private readonly ILogger<SignalRMonitorController> _logger;

    public SignalRMonitorController(
        IPresenceService presenceService,
        UserManager<ApplicationUser> userManager,
        AppDbContext db,
        ILogger<SignalRMonitorController> logger)
    {
        _presenceService = presenceService;
        _userManager = userManager;
        _db = db;
        _logger = logger;
    }

    // ── GET /api/admin/signalr/overview ──────────────────────────────────────
    /// <summary>
    /// Lấy toàn bộ thông tin các user đang online và số lượng connections của họ.
    /// Mỗi user có thể có nhiều connectionId (mở nhiều tab).
    /// </summary>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(SignalROverviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOverview()
    {
        var onlineUserIds = await _presenceService.GetAllOnlineUserIdsAsync();

        // Lấy thông tin profile của các user online song song
        var connectionInfos = new List<ConnectionInfoDto>();
        var totalConnections = 0;

        var tasks = onlineUserIds.Select(async userId =>
        {
            var connections = await _presenceService.GetConnectionsAsync(userId);
            var user = await _userManager.FindByIdAsync(userId);

            return new ConnectionInfoDto(
                UserId: userId,
                UserName: user?.TenTaiKhoan ?? user?.UserName ?? "Unknown",
                AvatarUrl: user?.AvatarUrl,
                ConnectionIds: connections,
                ConnectionCount: connections.Length,
                LastSeenAt: null // có thể extend sau
            );
        });

        var results = await Task.WhenAll(tasks);

        foreach (var info in results)
        {
            connectionInfos.Add(info);
            totalConnections += info.ConnectionCount;
        }

        // Sắp xếp theo số connections (nhiều nhất lên đầu)
        connectionInfos.Sort((a, b) => b.ConnectionCount.CompareTo(a.ConnectionCount));

        var stats = new SignalRStatsDto(
            TotalOnlineUsers: onlineUserIds.Count,
            TotalConnections: totalConnections,
            GeneratedAt: DateTime.UtcNow
        );

        return Ok(new SignalROverviewDto(stats, connectionInfos));
    }

    // ── GET /api/admin/signalr/users/{userId} ────────────────────────────────
    /// <summary>
    /// Kiểm tra trạng thái online và danh sách connectionId của một user cụ thể.
    /// </summary>
    [HttpGet("users/{userId}")]
    [ProducesResponseType(typeof(ConnectionInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserConnections(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound(new { message = "Không tìm thấy user." });

        var isOnline = await _presenceService.IsUserOnlineAsync(userId);
        var connections = isOnline
            ? await _presenceService.GetConnectionsAsync(userId)
            : Array.Empty<string>();

        return Ok(new ConnectionInfoDto(
            UserId: userId,
            UserName: user.TenTaiKhoan ?? user.UserName ?? "Unknown",
            AvatarUrl: user.AvatarUrl,
            ConnectionIds: connections,
            ConnectionCount: connections.Length,
            LastSeenAt: null
        ));
    }

    // ── GET /api/admin/signalr/stats ─────────────────────────────────────────
    /// <summary>
    /// Lấy thống kê nhanh: tổng số user online và tổng số connections.
    /// Nhẹ hơn /overview, phù hợp để poll liên tục.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(SignalRStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var onlineUserIds = await _presenceService.GetAllOnlineUserIdsAsync();

        var connectionCounts = await Task.WhenAll(
            onlineUserIds.Select(uid => _presenceService.GetConnectionsAsync(uid))
        );

        return Ok(new SignalRStatsDto(
            TotalOnlineUsers: onlineUserIds.Count,
            TotalConnections: connectionCounts.Sum(c => c.Length),
            GeneratedAt: DateTime.UtcNow
        ));
    }

    // ── POST /api/admin/signalr/broadcast ────────────────────────────────────
    /// <summary>
    /// Gửi thông báo hệ thống đến TẤT CẢ user đang online qua SignalR.
    /// </summary>
    [HttpPost("broadcast")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> BroadcastSystemMessage(
        [FromBody] BroadcastRequest request,
        [FromServices] IHubContext<InteractHub_Shared.Hubs.NotificationHub,
            InteractHub_Shared.Hubs.INotificationClient> hubContext)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Nội dung không thể trống." });

        var notification = new InteractHub_Shared.DTOs.Notifications.NotificationResponseDto
        {
            IdNotification       = Guid.NewGuid().ToString(),
            TriggeredByUserName  = "System",
            TriggeredByAvatarUrl = null,
            Type                 = "system",
            IdPost               = null,
            Message              = request.Message,
            IsRead               = false,
        };

        await hubContext.Clients.All.ReceiveNotification(notification);

        _logger.LogInformation("Admin broadcast: {Message}", request.Message);

        return Ok(new { message = $"Đã gửi tới tất cả users online.", timestamp = DateTime.UtcNow });
    }
}

public record BroadcastRequest(string Message);
