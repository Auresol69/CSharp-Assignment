using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace InteractHub_API.Services.Friends;

public class FriendService
{
    private readonly AppDbContext _context;
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<FriendService> _logger;

    public FriendService(AppDbContext context, IConnectionMultiplexer redis, ILogger<FriendService> logger)
    {
        _context = context;
        _redis = redis;
        _logger = logger;
    }

    // Gửi lời mời
    public async Task SendRequest(string currentUserId, string targetUserId)
    {
        if (currentUserId == targetUserId)
            throw new Exception("Không thể kết bạn với chính mình");

        var existing = await _context.Friendships
            .FirstOrDefaultAsync(f =>
                (f.IdNguoiGui == currentUserId && f.IdNguoiNhan == targetUserId) ||
                (f.IdNguoiGui == targetUserId && f.IdNguoiNhan == currentUserId)
            );

        if (existing != null)
        {
            if (existing.TrangThai == FriendshipStatus.Pending || existing.TrangThai == FriendshipStatus.Accepted)
                throw new Exception("Đã tồn tại mối quan hệ");

            _context.Friendships.Remove(existing); // gửi lại
        }

        _context.Friendships.Add(new Friendship
        {
            IdNguoiGui = currentUserId,
            IdNguoiNhan = targetUserId,
            TrangThai = FriendshipStatus.Pending
        });

        await _context.SaveChangesAsync();

        // Push event vào Redis Stream
        try
        {
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", targetUserId),
                new("senderId", currentUserId),
                new("notificationType", "FriendRequest"),
            });

            _logger.LogInformation("Event FriendRequest pushed to Redis Stream for {TargetUserId}.", targetUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pushing FriendRequest event to Redis Stream.");
        }
    }

    // Chấp nhận lời mời
    public async Task AcceptRequest(string currentUserId, string senderId)
    {
        var request = await _context.Friendships.FirstOrDefaultAsync(f =>
            f.IdNguoiGui == senderId &&
            f.IdNguoiNhan == currentUserId &&
            f.TrangThai == FriendshipStatus.Pending
        );

        if (request == null)
            throw new Exception("Không tìm thấy lời mời");

        request.TrangThai = FriendshipStatus.Accepted;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Friend request accepted by {CurrentUserId} from {SenderId}.", currentUserId, senderId);

        // Push event vào Redis Stream
        try
        {
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", senderId),
                new("senderId", currentUserId),
                new("notificationType", "AcceptRequest"),
            });

            _logger.LogInformation("Event AcceptRequest pushed to Redis Stream for {SenderId}.", senderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pushing AcceptRequest event to Redis Stream.");
        }
    }

    // Từ chối lời mời
    public async Task RejectRequest(string currentUserId, string senderId)
    {
        var request = await _context.Friendships.FirstOrDefaultAsync(f =>
            f.IdNguoiGui == senderId &&
            f.IdNguoiNhan == currentUserId &&
            f.TrangThai == FriendshipStatus.Pending
        );

        if (request == null)
            throw new Exception("Không tìm thấy lời mời");

        _context.Friendships.Remove(request);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Friend request rejected by {CurrentUserId} from {SenderId}.", currentUserId, senderId);

        // Push event vào Redis Stream
        try
        {
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", senderId),
                new("senderId", currentUserId),
                new("notificationType", "RejectRequest"),
            });

            _logger.LogInformation("Event RejectRequest pushed to Redis Stream for {SenderId}.", senderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pushing RejectRequest event to Redis Stream.");
        }
    }

    // Hủy lời mời đã gửi
    public async Task CancelRequest(string currentUserId, string targetUserId)
    {
        var request = await _context.Friendships.FirstOrDefaultAsync(f =>
            f.IdNguoiGui == currentUserId &&
            f.IdNguoiNhan == targetUserId &&
            f.TrangThai == FriendshipStatus.Pending
        );

        if (request == null)
            throw new Exception("Không tìm thấy lời mời để hủy");

        _context.Friendships.Remove(request);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Friend request canceled by {CurrentUserId} to {TargetUserId}.", currentUserId, targetUserId);

        // Push event vào Redis Stream
        try
        {
            var db = _redis.GetDatabase();
            await db.StreamAddAsync("interacthub:notifications:stream", new NameValueEntry[]
            {
                new("toUserId", targetUserId),
                new("senderId", currentUserId),
                new("notificationType", "CancelRequest"),
            });

            _logger.LogInformation("Event CancelRequest pushed to Redis Stream for {TargetUserId}.", targetUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pushing CancelRequest event to Redis Stream.");
        }
    }

    // Hủy kết bạn
    public async Task Unfriend(string currentUserId, string friendId)
    {
        var friendship = await _context.Friendships.FirstOrDefaultAsync(f =>
            (f.IdNguoiGui == currentUserId && f.IdNguoiNhan == friendId) ||
            (f.IdNguoiGui == friendId && f.IdNguoiNhan == currentUserId)
        );

        if (friendship == null || friendship.TrangThai != FriendshipStatus.Accepted)
            throw new Exception("Không tìm thấy mối quan hệ để hủy");

        _context.Friendships.Remove(friendship);
        await _context.SaveChangesAsync();
    }

    // Lấy danh sách bạn bè
    public async Task<List<FriendDto>> GetFriends(string userId)
    {
        return await _context.Friendships
            .Include(f => f.NguoiGui)
            .Include(f => f.NguoiNhan)
            .Where(f => f.TrangThai == FriendshipStatus.Accepted &&
                        (f.IdNguoiGui == userId || f.IdNguoiNhan == userId))
            .Select(f => new FriendDto
            {
                UserId = f.IdNguoiGui == userId ? f.IdNguoiNhan : f.IdNguoiGui,
                Name = f.IdNguoiGui == userId
                    ? (f.NguoiNhan!.UserName ?? string.Empty)
                    : (f.NguoiGui!.UserName ?? string.Empty),
                Avatar = string.Empty
            })
            .ToListAsync();
    }

    // Lấy lời mời nhận
    public async Task<List<FriendDto>> GetRequests(string userId)
    {
        return await _context.Friendships
            .Include(f => f.NguoiGui)
            .Where(f => f.IdNguoiNhan == userId && f.TrangThai == FriendshipStatus.Pending)
            .Select(f => new FriendDto
            {
                UserId = f.IdNguoiGui,
                Name = f.NguoiGui!.UserName ?? string.Empty,
                Avatar = string.Empty
            })
            .ToListAsync();
    }

    // Gợi ý kết bạn
    public async Task<List<FriendDto>> GetSuggestions(string userId)
    {
        var relatedIds = await _context.Friendships
            .Where(f => f.IdNguoiGui == userId || f.IdNguoiNhan == userId)
            .Select(f => f.IdNguoiGui == userId ? f.IdNguoiNhan : f.IdNguoiGui)
            .ToListAsync();

        return await _context.Users
            .Where(u => u.Id != userId && !relatedIds.Contains(u.Id))
            .Select(u => new FriendDto
            {
                UserId = u.Id,
                Name = u.UserName ?? string.Empty,
                Avatar = string.Empty
            })
            .Take(20)
            .ToListAsync();
    }
}
