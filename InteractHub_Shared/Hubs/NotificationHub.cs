using InteractHub_Shared.DTOs.Chat;
using InteractHub_Shared.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Security.Claims;


namespace InteractHub_Shared.Hubs;

// NotificationHub: Là lớp kế thừa từ Hub, đóng vai trò trung tâm giao tiếp giữa Server và các Client (trình duyệt, ứng dụng di động).
// : Hub<INotificationClient>: Đây là kỹ thuật Strongly-Typed Hub (Hub định kiểu mạnh).
// Thay vì gửi thông báo bằng chuỗi ký tự (string), use một interface (INotificationClient) 
// để định nghĩa các phương thức mà server có thể gọi trên client.
// Bắt buộc user phải đăng nhập (có token hợp lệ) mới được kết nối
[Authorize]
public class NotificationHub : Hub<INotificationClient>
{
    private readonly IPresenceService _presenceService;
    private readonly IChatService _chatService;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(
        IPresenceService presenceService,
        IChatService chatService,
        ILogger<NotificationHub> logger)
    {
        _presenceService = presenceService;
        _chatService = chatService;
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

    // ════════════════════════════════════════════════════
    // CHAT – Phương thức client gọi lên server (Hub Methods)
    // ════════════════════════════════════════════════════

    /// <summary>
    /// Client gọi để tham gia group SignalR của một cuộc hội thoại.
    /// Mỗi conversation có một group riêng để broadcast.
    /// </summary>
    public async Task JoinConversation(string conversationId)
    {
        var userId = GetUserId();
        if (userId == null) return;

        // Kiểm tra user có quyền truy cập conversation này không
        var hasAccess = await _chatService.UserHasAccessToConversationAsync(userId, conversationId);
        if (!hasAccess)
        {
            _logger.LogWarning("User {UserId} attempted to join conversation {ConvId} without access", userId, conversationId);
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetConversationGroup(conversationId));
        _logger.LogDebug("User {UserId} joined conversation group {ConvId}", userId, conversationId);
    }

    /// <summary>Rời khỏi group của cuộc hội thoại</summary>
    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetConversationGroup(conversationId));
    }

    /// <summary>
    /// Client gọi để gửi tin nhắn.
    /// Server lưu vào DB → broadcast cho tất cả trong conversation group.
    /// </summary>
    public async Task SendChatMessage(SendMessageRequest request)
    {
        var senderId = GetUserId();
        if (senderId == null) return;

        if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length > 2000)
        {
            _logger.LogWarning("User {UserId} sent invalid message content", senderId);
            return;
        }

        try
        {
            var result = await _chatService.SendMessageAsync(senderId, request);
            if (result == null) return;

            var signal = new NewMessageSignalDto
            {
                IdMessage = result.IdMessage,
                ConversationId = result.ConversationId,
                SenderId = result.SenderId,
                SenderName = result.SenderName,
                SenderAvatarUrl = result.SenderAvatarUrl,
                Content = result.Content,
                SentAt = result.SentAt
            };

            // Broadcast cho tất cả thành viên trong conversation group
            await Clients
                .Group(GetConversationGroup(result.ConversationId))
                .ReceiveChatMessage(signal);

            // Nếu người nhận chưa join group (không mở conversation),
            // gửi thêm push notification thông thường đến các connection của họ
            var receiverConnections = await _presenceService.GetConnectionsAsync(request.ReceiverId);
            if (receiverConnections.Length > 0)
            {
                await Clients.Clients(receiverConnections).ReceiveChatMessage(signal);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending chat message from {SenderId}", senderId);
        }
    }

    /// <summary>Client báo đang gõ tin nhắn</summary>
    public async Task StartTyping(string conversationId)
    {
        var userId = GetUserId();
        if (userId == null) return;

        // Chỉ broadcast cho người còn lại (Clients.OthersInGroup)
        await Clients
            .OthersInGroup(GetConversationGroup(conversationId))
            .UserTyping(conversationId, userId);
    }

    /// <summary>Client báo đã ngừng gõ</summary>
    public async Task StopTyping(string conversationId)
    {
        var userId = GetUserId();
        if (userId == null) return;

        await Clients
            .OthersInGroup(GetConversationGroup(conversationId))
            .UserStoppedTyping(conversationId, userId);
    }

    /// <summary>Client báo đã đọc tất cả tin nhắn trong conversation</summary>
    public async Task MarkConversationAsRead(string conversationId)
    {
        var userId = GetUserId();
        if (userId == null) return;

        await _chatService.MarkMessagesAsReadAsync(conversationId, userId);

        var signal = new MessagesReadSignalDto
        {
            ConversationId = conversationId,
            ReadByUserId = userId
        };

        // Báo cho người gửi biết tin nhắn đã được đọc
        await Clients
            .OthersInGroup(GetConversationGroup(conversationId))
            .MessagesMarkedAsRead(signal);
    }

    // ════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════

    private string? GetUserId() =>
        Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private static string GetConversationGroup(string conversationId) =>
        $"conversation_{conversationId}";
}