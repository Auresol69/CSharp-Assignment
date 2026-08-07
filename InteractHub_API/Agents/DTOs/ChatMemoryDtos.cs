namespace InteractHub_API.Agents.DTOs;

// ═══════════════════════════════════════════════════════════════════
// Chat Memory – DTOs for session history management
// ═══════════════════════════════════════════════════════════════════

/// <summary>
/// Represents a single chat turn stored in Redis.
/// </summary>
public class ChatMessage
{
    /// <summary>"user" or "assistant"</summary>
    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    /// <summary>UTC timestamp of when this message was added.</summary>
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// The full conversation window for a given session.
/// </summary>
public class SessionHistoryDto
{
    public string SessionId { get; set; } = string.Empty;

    /// <summary>Messages ordered oldest → newest.</summary>
    public List<ChatMessage> Messages { get; set; } = new();

    /// <summary>Max messages kept in the Redis window.</summary>
    public int WindowSize { get; set; }

    public int TotalMessages => Messages.Count;
}

/// <summary>
/// Request to add a message to a session.
/// </summary>
public class AddMessageRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
