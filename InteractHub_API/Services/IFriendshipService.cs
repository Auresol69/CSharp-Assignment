using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InteractHub_API.Services;

/// <summary>
/// Service quản lý các yêu cầu kết bạn (Friendship Requests).
/// Hỗ trợ gửi yêu cầu kết bạn và chấp nhận/từ chối.
/// Tích hợp SignalR để gửi thông báo realtime.
/// </summary>
public interface IFriendshipService
{
    /// <summary>
    /// Gửi yêu cầu kết bạn từ người gửi tới người nhận.
    /// Sau khi lưu vào DB, gửi thông báo realtime ReceiveFriendRequest qua SignalR.
    /// </summary>
    Task<bool> SendFriendRequestAsync(string senderId, string recipientId);

    /// <summary>
    /// Chấp nhận yêu cầu kết bạn từ người gửi.
    /// Sau khi update trạng thái DB, gửi thông báo realtime FriendRequestAccepted qua SignalR.
    /// </summary>
    Task<bool> AcceptFriendRequestAsync(string userId, string requestSenderId);

    /// <summary>
    /// Từ chối yêu cầu kết bạn.
    /// </summary>
    Task<bool> RejectFriendRequestAsync(string userId, string requestSenderId);

    /// <summary>
    /// Lấy danh sách yêu cầu kết bạn chưa được chấp nhận của người dùng.
    /// </summary>
    Task<List<Friendship>> GetPendingRequestsAsync(string userId);
}

