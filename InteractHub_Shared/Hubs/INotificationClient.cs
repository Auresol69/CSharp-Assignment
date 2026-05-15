namespace InteractHub_Shared.Hubs;

public interface INotificationClient
{
    // Tin nhắn realtime
    Task ReceiveMessage(string senderId, string message);

    // Người dùng online/offline
    Task UserConnected(string userId);

    Task UserDisconnected(string userId);

    // Yêu cầu kết bạn
    Task ReceiveFriendRequest(string senderId, string senderName, string senderAvatarUrl);

    // Chấp nhận yêu cầu kết bạn
    Task FriendRequestAccepted(string accepterId, string accepterName, string accepterAvatarUrl);
    Task ReceiveNotification(InteractHub_Shared.DTOs.Notifications.NotificationResponseDto notification);
}
