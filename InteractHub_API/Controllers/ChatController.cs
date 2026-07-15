using InteractHub_Shared.DTOs.Chat;
using InteractHub_Shared.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub_API.Controllers;

/// <summary>
/// ChatController – REST API cho tính năng chat thời gian thực.
/// Xử lý các thao tác không thể thực hiện qua SignalR (lấy lịch sử, tạo conversation).
/// Các thao tác thời gian thực (gửi tin, typing...) đều đi qua NotificationHub.
/// </summary>
[Authorize]
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User not authenticated");

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/chat/conversations
    // Lấy danh sách tất cả conversations của user hiện tại
    // ──────────────────────────────────────────────────────────────────────

    /// <summary>Lấy danh sách cuộc hội thoại của user hiện tại</summary>
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(IReadOnlyList<ConversationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConversations()
    {
        var userId = CurrentUserId;
        var conversations = await _chatService.GetConversationsAsync(userId);
        return Ok(conversations);
    }

    // ──────────────────────────────────────────────────────────────────────
    // POST /api/chat/conversations
    // Lấy hoặc tạo conversation với một user khác
    // ──────────────────────────────────────────────────────────────────────

    /// <summary>Lấy hoặc tạo cuộc hội thoại với một người dùng khác</summary>
    [HttpPost("conversations")]
    [ProducesResponseType(typeof(ConversationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetOrCreateConversation([FromBody] GetOrCreateConversationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OtherUserId))
            return BadRequest(new { message = "OtherUserId là bắt buộc." });

        var userId = CurrentUserId;

        if (userId == request.OtherUserId)
            return BadRequest(new { message = "Không thể tạo hội thoại với chính mình." });

        var conversation = await _chatService.GetOrCreateConversationAsync(userId, request.OtherUserId);
        if (conversation == null)
            return BadRequest(new { message = "Không tìm thấy người dùng hoặc không thể tạo hội thoại." });

        return Ok(conversation);
    }

    // ──────────────────────────────────────────────────────────────────────
    // GET /api/chat/conversations/{conversationId}/messages
    // Lấy lịch sử tin nhắn (cursor-based pagination)
    // ──────────────────────────────────────────────────────────────────────

    /// <summary>Lấy lịch sử tin nhắn trong một cuộc hội thoại</summary>
    /// <param name="conversationId">ID của cuộc hội thoại</param>
    /// <param name="take">Số tin nhắn muốn lấy (mặc định 30, tối đa 100)</param>
    /// <param name="beforeMessageId">Cursor: ID tin nhắn cuối cùng đã load (để load thêm về quá khứ)</param>
    [HttpGet("conversations/{conversationId}/messages")]
    [ProducesResponseType(typeof(IReadOnlyList<MessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMessages(
        [FromRoute] string conversationId,
        [FromQuery] int take = 30,
        [FromQuery] string? beforeMessageId = null)
    {
        var userId = CurrentUserId;

        var hasAccess = await _chatService.UserHasAccessToConversationAsync(userId, conversationId);
        if (!hasAccess)
            return Forbid();

        var request = new GetMessagesRequest
        {
            ConversationId = conversationId,
            Take = take,
            BeforeMessageId = beforeMessageId
        };

        var messages = await _chatService.GetMessagesAsync(userId, request);
        return Ok(messages);
    }

    // ──────────────────────────────────────────────────────────────────────
    // PUT /api/chat/conversations/{conversationId}/read
    // Đánh dấu tất cả tin nhắn chưa đọc là đã đọc (REST fallback)
    // ──────────────────────────────────────────────────────────────────────

    /// <summary>Đánh dấu đã đọc tất cả tin nhắn trong một cuộc hội thoại</summary>
    [HttpPut("conversations/{conversationId}/read")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> MarkAsRead([FromRoute] string conversationId)
    {
        var userId = CurrentUserId;

        var hasAccess = await _chatService.UserHasAccessToConversationAsync(userId, conversationId);
        if (!hasAccess)
            return Forbid();

        var count = await _chatService.MarkMessagesAsReadAsync(conversationId, userId);
        return Ok(new { markedCount = count, message = $"Đã đọc {count} tin nhắn." });
    }
}

/// <summary>Request body để tạo hoặc lấy conversation</summary>
public class GetOrCreateConversationRequest
{
    public string OtherUserId { get; set; } = string.Empty;
}
