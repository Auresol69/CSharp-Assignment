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
        var message = type switch
        {
            "Like" => $"{triggeredBy?.TenTaiKhoan ?? "Someone"} đã thích bài viết của bạn.",
            "Comment" => $"{triggeredBy?.TenTaiKhoan ?? "Someone"} đã bình luận về bài viết của bạn.",
            "FriendRequest" => $"{triggeredBy?.TenTaiKhoan ?? "Someone"} đã gửi cho bạn một lời mời kết bạn.",
            _ => $"{triggeredBy?.TenTaiKhoan ?? "Someone"} đã tương tác với bạn."
        };

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
}
