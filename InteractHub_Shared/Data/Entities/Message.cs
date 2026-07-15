namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho một tin nhắn trong cuộc hội thoại.
/// Maps to table: Message
/// </summary>
public class Message
{
    /// <summary>ID tin nhắn (GUID string)</summary>
    public string IdMessage { get; set; } = Guid.NewGuid().ToString();

    /// <summary>ID cuộc hội thoại</summary>
    public string ConversationId { get; set; } = string.Empty;

    /// <summary>ID người gửi</summary>
    public string SenderId { get; set; } = string.Empty;

    /// <summary>Nội dung tin nhắn (văn bản)</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Thời điểm gửi tin nhắn (UTC)</summary>
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    /// <summary>Tin nhắn đã được đọc bởi người nhận chưa</summary>
    public bool IsRead { get; set; } = false;

    /// <summary>Tin nhắn bị xóa bởi người gửi (soft-delete)</summary>
    public bool IsDeletedBySender { get; set; } = false;

    // ──────────────── Navigation Properties ────────────────

    public Conversation Conversation { get; set; } = null!;
    public ApplicationUser Sender { get; set; } = null!;
}
