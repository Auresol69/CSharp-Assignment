namespace InteractHub_Shared.DTOs.Chat;

// ─────────────── Requests ───────────────

/// <summary>Request gửi tin nhắn</summary>
public class SendMessageRequest
{
    /// <summary>ID người nhận</summary>
    public string ReceiverId { get; set; } = string.Empty;

    /// <summary>Nội dung tin nhắn (tối đa 2000 ký tự)</summary>
    public string Content { get; set; } = string.Empty;
}

/// <summary>Request lấy lịch sử chat phân trang (cursor-based)</summary>
public class GetMessagesRequest
{
    /// <summary>ID cuộc hội thoại</summary>
    public string ConversationId { get; set; } = string.Empty;

    /// <summary>Số tin nhắn muốn lấy (mặc định 30)</summary>
    public int Take { get; set; } = 30;

    /// <summary>Cursor: IdMessage cuối cùng đã load (null = lấy từ đầu)</summary>
    public string? BeforeMessageId { get; set; }
}

// ─────────────── Responses ───────────────

/// <summary>DTO trả về thông tin một tin nhắn</summary>
public class MessageDto
{
    public string IdMessage { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public bool IsOwnMessage { get; set; }
}

/// <summary>DTO trả về thông tin một cuộc hội thoại (dùng trong danh sách)</summary>
public class ConversationDto
{
    public string IdConversation { get; set; } = string.Empty;

    /// <summary>Người chat cùng (phía bên kia)</summary>
    public string OtherUserId { get; set; } = string.Empty;
    public string OtherUserName { get; set; } = string.Empty;
    public string? OtherUserAvatarUrl { get; set; }
    public bool IsOtherUserOnline { get; set; }

    /// <summary>Preview nội dung tin nhắn cuối</summary>
    public string? LastMessageContent { get; set; }
    public string? LastMessageSenderId { get; set; }
    public DateTime LastMessageAt { get; set; }

    /// <summary>Số tin nhắn chưa đọc</summary>
    public int UnreadCount { get; set; }
}

/// <summary>DTO real-time gửi qua SignalR khi có tin nhắn mới</summary>
public class NewMessageSignalDto
{
    public string IdMessage { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
}

/// <summary>DTO real-time khi tin nhắn được đánh dấu đã đọc</summary>
public class MessagesReadSignalDto
{
    public string ConversationId { get; set; } = string.Empty;
    public string ReadByUserId { get; set; } = string.Empty;
}
