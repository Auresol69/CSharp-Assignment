using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using InteractHub_Shared.Hubs;
using InteractHub_Shared.Services;
using StackExchange.Redis;

namespace InteractHub_API.Services;

/// <summary>
/// Triển khai FriendshipService: Quản lý yêu cầu kết bạn và gửi thông báo realtime qua SignalR.
/// </summary>
public class FriendshipService : IFriendshipService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPresenceService _presenceService;
    private readonly ILogger<FriendshipService> _logger;
    private readonly IConnectionMultiplexer _redis;

    public FriendshipService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        IPresenceService presenceService,
        ILogger<FriendshipService> logger,
        IConnectionMultiplexer redis)
    {
        _context = context;
        _userManager = userManager;
        _presenceService = presenceService;
        _logger = logger;
        _redis = redis;
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
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", recipientId),
                new("senderId", senderId),
                new("notificationType", "FriendRequest"),
            });

            _logger.LogInformation("Event FriendRequest pushed to Redis Stream for {RecipientId}.", recipientId);
        }
        catch (Exception ex)
        {
            // Nếu Redis có sập, Friendship vẫn đã lưu vào SQL, 
            // có thể log lỗi để xử lý bù sau.
            _logger.LogError(ex, "Lỗi khi đẩy sự kiện vào Redis Stream.");
        }

        return true;
    }

    /// <summary>
    /// Chấp nhận yêu cầu kết bạn: Update status từ "Pending" thành "Accepted".
    /// Sau đó push event FriendshipAccepted vào Redis Stream để Worker xử lý.
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

        _logger.LogInformation("Friend request accepted by {UserId} from {SenderId}.", userId, requestSenderId);

        // Push event vào Redis Stream
        try
        {
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", requestSenderId),
                new("senderId", userId),
                new("notificationType", "FriendshipAccepted"),
            });

            _logger.LogInformation("Event FriendshipAccepted pushed to Redis Stream for {SenderId}.", requestSenderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pushing FriendshipAccepted event to Redis Stream.");
        }

        return true;
    }

    /// <summary>
    /// Từ chối yêu cầu kết bạn: Xóa record từ DB.
    /// Push event FriendshipRejected vào Redis Stream để Worker xử lý cleanup.
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

        _logger.LogInformation("Friend request rejected by {UserId} from {SenderId}.", userId, requestSenderId);

        // Push event vào Redis Stream
        try
        {
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", requestSenderId),
                new("senderId", userId),
                new("notificationType", "FriendshipRejected"),
            });

            _logger.LogInformation("Event FriendshipRejected pushed to Redis Stream for {SenderId}.", requestSenderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pushing FriendshipRejected event to Redis Stream.");
        }

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

