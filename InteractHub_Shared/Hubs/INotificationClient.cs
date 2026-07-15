using InteractHub_Shared.DTOs.Chat;

namespace InteractHub_Shared.Hubs;

public interface INotificationClient
{
    // ── Notification cũ ──────────────────────────────────────────────

    /// <summary>Thông báo chung (like, comment, friend request...)</summary>
    Task ReceiveNotification(InteractHub_Shared.DTOs.Notifications.NotificationResponseDto notification);

    // ── Presence (online/offline) ─────────────────────────────────────

    /// <summary>Báo hiệu user vừa online</summary>
    Task UserConnected(string userId);

    /// <summary>Báo hiệu user vừa offline</summary>
    Task UserDisconnected(string userId);

    // ── Friend ────────────────────────────────────────────────────────

    /// <summary>Nhận yêu cầu kết bạn</summary>
    Task ReceiveFriendRequest(string senderId, string senderName, string senderAvatarUrl);

    /// <summary>Yêu cầu kết bạn được chấp nhận</summary>
    Task FriendRequestAccepted(string accepterId, string accepterName, string accepterAvatarUrl);

    // ── Chat (Thời gian thực) ─────────────────────────────────────────

    /// <summary>Nhận tin nhắn mới từ người khác</summary>
    Task ReceiveChatMessage(NewMessageSignalDto message);

    /// <summary>Đối phương đã đọc tin nhắn của mình</summary>
    Task MessagesMarkedAsRead(MessagesReadSignalDto signal);

    /// <summary>Đối phương đang gõ tin nhắn</summary>
    Task UserTyping(string conversationId, string userId);

    /// <summary>Đối phương dừng gõ tin nhắn</summary>
    Task UserStoppedTyping(string conversationId, string userId);

    // ── Legacy: giữ lại để không break client cũ ─────────────────────

    /// <summary>[Deprecated] Dùng ReceiveChatMessage thay thế</summary>
    Task ReceiveMessage(string senderId, string message);
}
