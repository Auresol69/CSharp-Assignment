using InteractHub_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace InteractHub_API.Hubs;

// NotificationHub: Là lớp kế thừa từ Hub, đóng vai trò trung tâm giao tiếp giữa Server và các Client (trình duyệt, ứng dụng di động).
// : Hub<INotificationClient>: Đây là kỹ thuật Strongly-Typed Hub (Hub định kiểu mạnh).
// Thay vì gửi thông báo bằng chuỗi ký tự (string), use một interface (INotificationClient) 
// để định nghĩa các phương thức mà server có thể gọi trên client.
// Bắt buộc user phải đăng nhập (có token hợp lệ) mới được kết nối
[Authorize]
public class NotificationHub : Hub<INotificationClient>
{
    private readonly IPresenceService _presenceService;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(IPresenceService presenceService, ILogger<NotificationHub> logger)
    {
        _presenceService = presenceService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        // Lấy User ID từ Claims trong JWT Token
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId != null)
        {
            // Lưu kết nối vào Redis (sử dụng cấu trúc Set)
            await _presenceService.AddConnectionAsync(userId, Context.ConnectionId);

            _logger.LogInformation($"User {userId} connected with connection ID {Context.ConnectionId}");

            // (Option không dùng cũng được) Báo cho mọi người biết user này vừa online
            await Clients.Others.UserConnected(userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId != null)
        {
            // Xóa kết nối khỏi Redis
            await _presenceService.RemoveConnectionAsync(userId, Context.ConnectionId);

            _logger.LogInformation($"User {userId} disconnected with connection ID {Context.ConnectionId}");

            // Nếu muốn, kiểm tra xem user còn online ở tab nào khác không
            var isStillOnline = await _presenceService.IsUserOnlineAsync(userId);
            if (!isStillOnline)
            {
                // Báo cho mọi người biết user này đã offline hoàn toàn
                await Clients.Others.UserDisconnected(userId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}