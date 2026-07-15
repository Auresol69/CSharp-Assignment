using InteractHub_Shared.DTOs.Chat;

namespace InteractHub_Shared.Services;

/// <summary>
/// Contract cho Chat Service – xử lý logic nghiệp vụ của tính năng chat thời gian thực.
/// Interface này nằm trong Shared để NotificationHub (Shared) có thể inject.
/// Implementation (ChatService) nằm trong InteractHub_API/Services.
/// </summary>
public interface IChatService
{
    /// <summary>Lấy danh sách conversation của user (sắp xếp theo tin nhắn mới nhất).</summary>
    Task<IReadOnlyList<ConversationDto>> GetConversationsAsync(string userId);

    /// <summary>Lấy hoặc tạo mới conversation 1-1 giữa hai user.</summary>
    Task<ConversationDto?> GetOrCreateConversationAsync(string userId, string otherUserId);

    /// <summary>Lấy lịch sử tin nhắn trong một conversation (cursor-based pagination).</summary>
    Task<IReadOnlyList<MessageDto>> GetMessagesAsync(string userId, GetMessagesRequest request);

    /// <summary>Lưu tin nhắn mới vào DB và trả về DTO để broadcast qua SignalR.</summary>
    Task<MessageDto?> SendMessageAsync(string senderId, SendMessageRequest request);

    /// <summary>Đánh dấu tất cả tin nhắn chưa đọc trong conversation là đã đọc.</summary>
    Task<int> MarkMessagesAsReadAsync(string conversationId, string userId);

    /// <summary>Kiểm tra user có quyền truy cập conversation không (là thành viên của conversation).</summary>
    Task<bool> UserHasAccessToConversationAsync(string userId, string conversationId);
}
