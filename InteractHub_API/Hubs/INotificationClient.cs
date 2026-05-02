namespace InteractHub_API.Hubs;

public interface INotificationClient
{
    // Client cần lắng nghe sự kiện này
    Task ReceiveMessage(string senderId, string message);

    // Ví dụ: Gửi thông báo có người online
    Task UserConnected(string userId);

    Task UserDisconnected(string userId);
}