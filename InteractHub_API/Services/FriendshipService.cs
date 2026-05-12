using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using InteractHub_API.Hubs;

namespace InteractHub_API.Services;

/// <summary>
/// Triển khai FriendshipService: Quản lý yêu cầu kết bạn và gửi thông báo realtime qua SignalR.
/// </summary>
public class FriendshipService : IFriendshipService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPresenceService _presenceService;
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;
    private readonly ILogger<FriendshipService> _logger;
    private readonly INotificationService _notificationService;

    public FriendshipService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        IPresenceService presenceService,
        IHubContext<NotificationHub, INotificationClient> hubContext,
        ILogger<FriendshipService> logger,
        INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _presenceService = presenceService;
        _hubContext = hubContext;
        _logger = logger;
        _notificationService = notificationService;
    }

    /// <summary>
    /// Gửi yêu cầu kết bạn: Tạo record Friendship với status "Pending" trong DB.
    /// Sau đó lấy danh sách connectionId của người nhận từ IPresenceService
    /// và gửi thông báo ReceiveFriendRequest qua SignalR.
    /// </summary>
    public async Task<bool> SendFriendRequestAsync(string senderId, string recipientId)
    {
        if (senderId == recipientId)
        {
            _logger.LogWarning("User {SenderId} tried to send friend request to themselves.", senderId);
            return false;
        }

        // Kiểm tra người gửi và người nhận có tồn tại không
        var sender = await _userManager.FindByIdAsync(senderId);
        var recipient = await _userManager.FindByIdAsync(recipientId);

        if (sender == null || recipient == null)
        {
            _logger.LogWarning("Sender or recipient not found.");
            return false;
        }

        // Kiểm tra xem đã có friendship record chưa
        var existingFriendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.IdNguoiGui == senderId && f.IdNguoiNhan == recipientId) ||
                (f.IdNguoiGui == recipientId && f.IdNguoiNhan == senderId));

        if (existingFriendship != null)
        {
            _logger.LogWarning("Friendship already exists between {SenderId} and {RecipientId}.", senderId, recipientId);
            return false;
        }

        // Tạo friend request mới với status "Pending"
        var friendship = new Friendship
        {
            IdNguoiGui = senderId,
            IdNguoiNhan = recipientId,
            TrangThai = "Pending"
        };

        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Friend request sent from {SenderId} to {RecipientId}.", senderId, recipientId);

        // Gửi thông báo realtime qua SignalR
        try
        {
            var connections = await _presenceService.GetConnectionsAsync(recipientId);
            if (connections.Length > 0)
            {
                await _hubContext.Clients
                    .Clients(connections)
                    .ReceiveFriendRequest(senderId, sender.TenTaiKhoan ?? "Unknown", sender.AvatarUrl ?? "");

                _logger.LogInformation("Friend request notification sent to {RecipientId}.", recipientId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending friend request notification to {RecipientId}.", recipientId);
            // Notification lỗi không nên gây fail toàn bộ request
        }

        // Persist notification
        try
        {
            await _notificationService.CreateAndSendNotificationAsync(recipientId, senderId, null, "FriendRequest");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error persisting/sending friend request notification to {RecipientId}.", recipientId);
        }

        return true;
    }

    /// <summary>
    /// Chấp nhận yêu cầu kết bạn: Update status từ "Pending" thành "Accepted".
    /// Sau đó gửi thông báo FriendRequestAccepted tới người gửi yêu cầu ban đầu.
    /// </summary>
    public async Task<bool> AcceptFriendRequestAsync(string userId, string requestSenderId)
    {
        // Tìm friend request record
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                f.IdNguoiGui == requestSenderId &&
                f.IdNguoiNhan == userId &&
                f.TrangThai == "Pending");

        if (friendship == null)
        {
            _logger.LogWarning("Friend request not found from {SenderId} to {UserId}.", requestSenderId, userId);
            return false;
        }

        // Update status thành "Accepted"
        friendship.TrangThai = "Accepted";
        _context.Friendships.Update(friendship);
        await _context.SaveChangesAsync();

        // Xóa thông báo lời mời pending ở người nhận vì đã xử lý xong
        await _notificationService.DeleteByCriteriaAsync(userId, requestSenderId, "FriendRequest");

        _logger.LogInformation("Friend request accepted by {UserId} from {SenderId}.", userId, requestSenderId);

        // Gửi thông báo realtime qua SignalR
        try
        {
            var accepter = await _userManager.FindByIdAsync(userId);
            var connections = await _presenceService.GetConnectionsAsync(requestSenderId);

            if (connections.Length > 0 && accepter != null)
            {
                await _hubContext.Clients
                    .Clients(connections)
                    .FriendRequestAccepted(userId, accepter.TenTaiKhoan ?? "Unknown", accepter.AvatarUrl ?? "");

                _logger.LogInformation("Friend request acceptance notification sent to {SenderId}.", requestSenderId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending acceptance notification to {SenderId}.", requestSenderId);
        }

        // Persist notification to sender
        try
        {
            await _notificationService.CreateAndSendNotificationAsync(requestSenderId, userId, null, "FriendRequestAccepted");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error persisting/sending acceptance notification to {SenderId}.", requestSenderId);
        }

        return true;
    }

    /// <summary>
    /// Từ chối yêu cầu kết bạn: Xóa record từ DB.
    /// </summary>
    public async Task<bool> RejectFriendRequestAsync(string userId, string requestSenderId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                f.IdNguoiGui == requestSenderId &&
                f.IdNguoiNhan == userId &&
                f.TrangThai == "Pending");

        if (friendship == null)
        {
            _logger.LogWarning("Friend request not found from {SenderId} to {UserId}.", requestSenderId, userId);
            return false;
        }

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();

        // Lời mời bị từ chối thì xóa notification pending ở người nhận
        await _notificationService.DeleteByCriteriaAsync(userId, requestSenderId, "FriendRequest");

        _logger.LogInformation("Friend request rejected by {UserId} from {SenderId}.", userId, requestSenderId);
        return true;
    }

    /// <summary>
    /// Lấy danh sách yêu cầu kết bạn chưa được chấp nhận của người dùng.
    /// </summary>
    public async Task<List<Friendship>> GetPendingRequestsAsync(string userId)
    {
        return await _context.Friendships
            .Where(f => f.IdNguoiNhan == userId && f.TrangThai == "Pending")
            .ToListAsync();
    }
}

