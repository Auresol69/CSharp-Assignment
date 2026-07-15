using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Chat;
using InteractHub_Shared.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InteractHub_Shared.Services;

// ══════════════════════════════════════════════════════════════
// IMPLEMENTATION
// IChatService interface nằm trong IChatService.cs (InteractHub_Shared/Services)
// ══════════════════════════════════════════════════════════════

public class ChatService : IChatService
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPresenceService _presenceService;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        IPresenceService presenceService,
        ILogger<ChatService> logger)
    {
        _db = db;
        _userManager = userManager;
        _presenceService = presenceService;
        _logger = logger;
    }

    // ──────────────────────────────────────────────────────────────────
    // Lấy danh sách conversations
    // ──────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<ConversationDto>> GetConversationsAsync(string userId)
    {
        var conversations = await _db.Conversations
            .AsNoTracking()
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .Include(c => c.User1)
            .Include(c => c.User2)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .OrderByDescending(c => c.LastMessageAt)
            .ToListAsync();

        var result = new List<ConversationDto>(conversations.Count);
        foreach (var conv in conversations)
        {
            var otherUser = conv.User1Id == userId ? conv.User2 : conv.User1;
            var lastMessage = conv.Messages.FirstOrDefault();

            var unreadCount = await _db.Messages
                .CountAsync(m => m.ConversationId == conv.IdConversation
                                 && m.SenderId != userId
                                 && !m.IsRead);

            var isOnline = await _presenceService.IsUserOnlineAsync(otherUser.Id);

            result.Add(new ConversationDto
            {
                IdConversation = conv.IdConversation,
                OtherUserId = otherUser.Id,
                OtherUserName = otherUser.TenTaiKhoan ?? otherUser.UserName ?? "Unknown",
                OtherUserAvatarUrl = otherUser.AvatarUrl,
                IsOtherUserOnline = isOnline,
                LastMessageContent = lastMessage?.Content,
                LastMessageSenderId = lastMessage?.SenderId,
                LastMessageAt = conv.LastMessageAt,
                UnreadCount = unreadCount
            });
        }

        return result;
    }

    // ──────────────────────────────────────────────────────────────────
    // Lấy hoặc tạo conversation 1-1
    // ──────────────────────────────────────────────────────────────────

    public async Task<ConversationDto?> GetOrCreateConversationAsync(string userId, string otherUserId)
    {
        if (userId == otherUserId) return null;

        var otherUser = await _userManager.FindByIdAsync(otherUserId);
        if (otherUser == null) return null;

        // Chuẩn hoá: user1 luôn có ID nhỏ hơn → tránh tạo 2 conversation giữa 2 người
        var (user1Id, user2Id) = string.CompareOrdinal(userId, otherUserId) < 0
            ? (userId, otherUserId)
            : (otherUserId, userId);

        var existing = await _db.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.User1Id == user1Id && c.User2Id == user2Id);

        if (existing != null)
        {
            var isOnline = await _presenceService.IsUserOnlineAsync(otherUserId);
            var unread = await _db.Messages.CountAsync(m =>
                m.ConversationId == existing.IdConversation
                && m.SenderId != userId
                && !m.IsRead);

            return new ConversationDto
            {
                IdConversation = existing.IdConversation,
                OtherUserId = otherUserId,
                OtherUserName = otherUser.TenTaiKhoan ?? otherUser.UserName ?? "Unknown",
                OtherUserAvatarUrl = otherUser.AvatarUrl,
                IsOtherUserOnline = isOnline,
                LastMessageAt = existing.LastMessageAt,
                UnreadCount = unread
            };
        }

        // Tạo mới
        var newConv = new Conversation
        {
            User1Id = user1Id,
            User2Id = user2Id,
        };

        _db.Conversations.Add(newConv);
        await _db.SaveChangesAsync();

        var onlineNow = await _presenceService.IsUserOnlineAsync(otherUserId);

        return new ConversationDto
        {
            IdConversation = newConv.IdConversation,
            OtherUserId = otherUserId,
            OtherUserName = otherUser.TenTaiKhoan ?? otherUser.UserName ?? "Unknown",
            OtherUserAvatarUrl = otherUser.AvatarUrl,
            IsOtherUserOnline = onlineNow,
            LastMessageAt = newConv.LastMessageAt,
            UnreadCount = 0
        };
    }

    // ──────────────────────────────────────────────────────────────────
    // Lấy lịch sử tin nhắn (cursor-based pagination)
    // ──────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<MessageDto>> GetMessagesAsync(string userId, GetMessagesRequest request)
    {
        var hasAccess = await UserHasAccessToConversationAsync(userId, request.ConversationId);
        if (!hasAccess) return Array.Empty<MessageDto>();

        var take = Math.Clamp(request.Take, 1, 100);

        IQueryable<Message> query = _db.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == request.ConversationId);

        // Nếu có cursor → lấy tin nhắn cũ hơn cursor (load more)
        if (!string.IsNullOrWhiteSpace(request.BeforeMessageId))
        {
            var cursorMsg = await _db.Messages
                .AsNoTracking()
                .Where(m => m.IdMessage == request.BeforeMessageId)
                .Select(m => m.SentAt)
                .FirstOrDefaultAsync();

            if (cursorMsg != default)
            {
                query = query.Where(m => m.SentAt < cursorMsg);
            }
        }

        var messages = await query
            .OrderByDescending(m => m.SentAt)
            .Take(take)
            .ToListAsync();

        // Đảo lại thứ tự để client hiển thị cũ → mới
        messages.Reverse();

        return messages.Select(m => new MessageDto
        {
            IdMessage = m.IdMessage,
            ConversationId = m.ConversationId,
            SenderId = m.SenderId,
            SenderName = m.Sender?.TenTaiKhoan ?? m.Sender?.UserName ?? "Unknown",
            SenderAvatarUrl = m.Sender?.AvatarUrl,
            Content = m.Content,
            SentAt = m.SentAt,
            IsRead = m.IsRead,
            IsOwnMessage = m.SenderId == userId
        }).ToList();
    }

    // ──────────────────────────────────────────────────────────────────
    // Gửi tin nhắn
    // ──────────────────────────────────────────────────────────────────

    public async Task<MessageDto?> SendMessageAsync(string senderId, SendMessageRequest request)
    {
        var sender = await _userManager.FindByIdAsync(senderId);
        if (sender == null) return null;

        // Lấy hoặc tạo conversation
        var (user1Id, user2Id) = string.CompareOrdinal(senderId, request.ReceiverId) < 0
            ? (senderId, request.ReceiverId)
            : (request.ReceiverId, senderId);

        var conv = await _db.Conversations
            .FirstOrDefaultAsync(c => c.User1Id == user1Id && c.User2Id == user2Id);

        if (conv == null)
        {
            conv = new Conversation { User1Id = user1Id, User2Id = user2Id };
            _db.Conversations.Add(conv);
        }

        var message = new Message
        {
            ConversationId = conv.IdConversation,
            SenderId = senderId,
            Content = request.Content.Trim(),
            SentAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        conv.LastMessageAt = message.SentAt;

        await _db.SaveChangesAsync();

        _logger.LogDebug("Message {MsgId} saved in conversation {ConvId}", message.IdMessage, conv.IdConversation);

        return new MessageDto
        {
            IdMessage = message.IdMessage,
            ConversationId = conv.IdConversation,
            SenderId = senderId,
            SenderName = sender.TenTaiKhoan ?? sender.UserName ?? "Unknown",
            SenderAvatarUrl = sender.AvatarUrl,
            Content = message.Content,
            SentAt = message.SentAt,
            IsRead = false,
            IsOwnMessage = true
        };
    }

    // ──────────────────────────────────────────────────────────────────
    // Đánh dấu đã đọc
    // ──────────────────────────────────────────────────────────────────

    public async Task<int> MarkMessagesAsReadAsync(string conversationId, string userId)
    {
        var unread = await _db.Messages
            .Where(m => m.ConversationId == conversationId
                        && m.SenderId != userId   // không tự mark tin của mình
                        && !m.IsRead)
            .ToListAsync();

        if (unread.Count == 0) return 0;

        foreach (var msg in unread) msg.IsRead = true;

        await _db.SaveChangesAsync();
        return unread.Count;
    }

    // ──────────────────────────────────────────────────────────────────
    // Kiểm tra quyền truy cập
    // ──────────────────────────────────────────────────────────────────

    public async Task<bool> UserHasAccessToConversationAsync(string userId, string conversationId)
    {
        return await _db.Conversations
            .AnyAsync(c => c.IdConversation == conversationId
                           && (c.User1Id == userId || c.User2Id == userId));
    }
}
