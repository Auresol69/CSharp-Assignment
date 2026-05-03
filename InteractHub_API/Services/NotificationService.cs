using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Notifications;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using InteractHub_API.Hubs;

namespace InteractHub_API.Services;

public interface INotificationService
{
    Task CreateAndSendNotificationAsync(string receiverId, string triggeredById, string? postId, string type);
    Task<IReadOnlyList<NotificationResponseDto>> GetUserNotificationsAsync(string userId, int take = 100);
    Task<bool> MarkAsReadAsync(string notificationId, string userId);
    Task<int> MarkAllAsReadAsync(string userId);
    Task<bool> DeleteNotificationAsync(string notificationId, string userId);
    Task<int> DeleteByCriteriaAsync(string receiverId, string triggeredById, string type, string? postId = null);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPresenceService _presenceService;
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IPresenceService presenceService,
        IHubContext<NotificationHub, INotificationClient> hubContext,
        ILogger<NotificationService> logger)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _presenceService = presenceService;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task CreateAndSendNotificationAsync(string receiverId, string triggeredById, string? postId, string type)
    {
        // create entity
        var notification = new Notification
        {
            IdTaiKhoan = receiverId,
            TriggeredByUserId = triggeredById,
            IdPost = postId,
            Type = type,
            IsRead = false
        };

        _dbContext.Notifications.Add(notification);
        await _dbContext.SaveChangesAsync();

        // prepare DTO
        var triggeredBy = await _userManager.FindByIdAsync(triggeredById);
        var message = BuildMessage(type, triggeredBy?.TenTaiKhoan);

        var dto = new NotificationResponseDto
        {
            IdNotification = notification.IdNotification,
            IdPost = postId,
            Type = type,
            IsRead = notification.IsRead,
            TriggeredByUserName = triggeredBy?.TenTaiKhoan,
            TriggeredByAvatarUrl = triggeredBy?.AvatarUrl,
            Message = message
        };

        // send realtime
        try
        {
            var connections = await _presenceService.GetConnectionsAsync(receiverId);
            if (connections.Length > 0)
            {
                await _hubContext.Clients.Clients(connections).ReceiveNotification(dto);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification realtime to {ReceiverId}", receiverId);
        }
    }

    public async Task<IReadOnlyList<NotificationResponseDto>> GetUserNotificationsAsync(string userId, int take = 100)
    {
        var notifications = await _dbContext.Notifications
            .AsNoTracking()
            .Where(n => n.IdTaiKhoan == userId)
            .Include(n => n.TriggeredByUser)
            .OrderByDescending(n => n.IdNotification)
            .Take(Math.Clamp(take, 1, 500))
            .ToListAsync();

        return notifications.Select(n => new NotificationResponseDto
        {
            IdNotification = n.IdNotification,
            IdPost = n.IdPost,
            Type = n.Type,
            IsRead = n.IsRead,
            TriggeredByUserName = n.TriggeredByUser?.TenTaiKhoan,
            TriggeredByAvatarUrl = n.TriggeredByUser?.AvatarUrl,
            Message = BuildMessage(n.Type, n.TriggeredByUser?.TenTaiKhoan)
        }).ToList();
    }

    public async Task<bool> MarkAsReadAsync(string notificationId, string userId)
    {
        var notification = await _dbContext.Notifications
            .FirstOrDefaultAsync(n => n.IdNotification == notificationId && n.IdTaiKhoan == userId);

        if (notification is null)
        {
            return false;
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _dbContext.SaveChangesAsync();
        }

        return true;
    }

    public async Task<int> MarkAllAsReadAsync(string userId)
    {
        var unread = await _dbContext.Notifications
            .Where(n => n.IdTaiKhoan == userId && !n.IsRead)
            .ToListAsync();

        if (unread.Count == 0)
        {
            return 0;
        }

        foreach (var item in unread)
        {
            item.IsRead = true;
        }

        await _dbContext.SaveChangesAsync();
        return unread.Count;
    }

    public async Task<bool> DeleteNotificationAsync(string notificationId, string userId)
    {
        var notification = await _dbContext.Notifications
            .FirstOrDefaultAsync(n => n.IdNotification == notificationId && n.IdTaiKhoan == userId);

        if (notification is null)
        {
            return false;
        }

        _dbContext.Notifications.Remove(notification);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<int> DeleteByCriteriaAsync(string receiverId, string triggeredById, string type, string? postId = null)
    {
        var query = _dbContext.Notifications
            .Where(n => n.IdTaiKhoan == receiverId
                        && n.TriggeredByUserId == triggeredById
                        && n.Type == type);

        if (!string.IsNullOrWhiteSpace(postId))
        {
            query = query.Where(n => n.IdPost == postId);
        }

        var rows = await query.ToListAsync();
        if (rows.Count == 0)
        {
            return 0;
        }

        _dbContext.Notifications.RemoveRange(rows);
        await _dbContext.SaveChangesAsync();
        return rows.Count;
    }

    private static string BuildMessage(string? type, string? triggeredByName)
    {
        var actor = string.IsNullOrWhiteSpace(triggeredByName) ? "Someone" : triggeredByName;
        return type switch
        {
            "Like" => $"{actor} đã thích bài viết của bạn.",
            "Comment" => $"{actor} đã bình luận về bài viết của bạn.",
            "FriendRequest" => $"{actor} đã gửi cho bạn một lời mời kết bạn.",
            "AcceptRequest" => $"{actor} đã chấp nhận lời mời kết bạn của bạn.",
            "FriendRequestAccepted" => $"{actor} đã chấp nhận lời mời kết bạn của bạn.",
            _ => $"{actor} đã tương tác với bạn."
        };
    }
}
