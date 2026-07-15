namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho một cuộc hội thoại 1-1 giữa hai người dùng.
/// Maps to table: Conversation
/// </summary>
public class Conversation
{
    /// <summary>ID cuộc hội thoại (GUID string)</summary>
    public string IdConversation { get; set; } = Guid.NewGuid().ToString();

    /// <summary>ID người dùng thứ nhất (luôn là user có ID nhỏ hơn để tránh tạo duplicate)</summary>
    public string User1Id { get; set; } = string.Empty;

    /// <summary>ID người dùng thứ hai</summary>
    public string User2Id { get; set; } = string.Empty;

    /// <summary>Thời điểm tạo cuộc hội thoại</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Thời điểm tin nhắn cuối cùng (để sort danh sách conversations)</summary>
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    // ──────────────── Navigation Properties ────────────────

    public ApplicationUser User1 { get; set; } = null!;
    public ApplicationUser User2 { get; set; } = null!;

    /// <summary>Danh sách tin nhắn trong cuộc hội thoại</summary>
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
