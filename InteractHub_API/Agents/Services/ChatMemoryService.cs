using System.Diagnostics;
using System.Text.Json;
using InteractHub_API.Agents.DTOs;
using StackExchange.Redis;

namespace InteractHub_API.Agents.Services;

// ═══════════════════════════════════════════════════════════════════
// Chat Memory Service – Feature 1
//
// Stores per-session conversation history in a Redis List.
//
// Key layout:
//   chat:session:{sessionId}  → Redis List of JSON-serialised ChatMessage
//
// Strategy:
//   LPUSH new message → LTRIM to last N → LRANGE to read
//   All keys carry an expiry (default 24 h) that is refreshed on every write.
// ═══════════════════════════════════════════════════════════════════

public interface IChatMemoryService
{
    /// <summary>
    /// Append a new message to a session's history window.
    /// The oldest messages beyond <see cref="WindowSize"/> are automatically evicted.
    /// </summary>
    Task AddMessageAsync(string sessionId, string role, string content, CancellationToken ct = default);

    /// <summary>
    /// Retrieve the full history window for a session, ordered oldest → newest.
    /// Returns an empty list if the session does not exist.
    /// </summary>
    Task<SessionHistoryDto> GetHistoryAsync(string sessionId, CancellationToken ct = default);

    /// <summary>
    /// Build a formatted prompt prefix from session history ready to inject
    /// into an LLM system or user message.
    /// </summary>
    Task<string> BuildPromptHistoryAsync(string sessionId, CancellationToken ct = default);

    /// <summary>
    /// Permanently delete a session from Redis.
    /// </summary>
    Task ClearSessionAsync(string sessionId, CancellationToken ct = default);

    /// <summary>
    /// Maximum messages kept per session (configurable via ChatBot:SessionHistoryWindow).
    /// </summary>
    int WindowSize { get; }
}

public class ChatMemoryService : IChatMemoryService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<ChatMemoryService> _logger;
    private readonly int _windowSize;
    private readonly TimeSpan _sessionTtl;

    // Redis key template
    private static string SessionKey(string sessionId) => $"chat:session:{sessionId}";

    public int WindowSize => _windowSize;

    public ChatMemoryService(
        IConnectionMultiplexer redis,
        IConfiguration configuration,
        ILogger<ChatMemoryService> logger)
    {
        _redis = redis;
        _logger = logger;
        _windowSize = configuration.GetValue("ChatBot:SessionHistoryWindow", 10);
        _sessionTtl = TimeSpan.FromHours(configuration.GetValue("ChatBot:SessionTtlHours", 24.0));
    }

    // ──────────────────────────────────────────────────────────────
    // AddMessageAsync
    // ──────────────────────────────────────────────────────────────

    public async Task AddMessageAsync(
        string sessionId, string role, string content, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("sessionId must not be empty.", nameof(sessionId));
        if (string.IsNullOrWhiteSpace(role))
            throw new ArgumentException("role must not be empty.", nameof(role));

        var db = _redis.GetDatabase();
        var key = SessionKey(sessionId);

        var message = new ChatMessage
        {
            Role = role.ToLowerInvariant(),
            Content = content,
            Timestamp = DateTimeOffset.UtcNow
        };

        var json = JsonSerializer.Serialize(message);

        // Pipeline: LPUSH + LTRIM + EXPIRE in one round-trip
        var batch = db.CreateBatch();

        var pushTask  = batch.ListLeftPushAsync(key, json);
        // Keep only the last _windowSize messages (LTRIM keeps indices [0 … N-1])
        var trimTask  = batch.ListTrimAsync(key, 0, _windowSize - 1);
        var expTask   = batch.KeyExpireAsync(key, _sessionTtl);

        batch.Execute();

        await Task.WhenAll(pushTask, trimTask, expTask);

        _logger.LogDebug(
            "ChatMemory: added [{Role}] to session {Session} (window={Window})",
            role, sessionId, _windowSize);
    }

    // ──────────────────────────────────────────────────────────────
    // GetHistoryAsync
    // ──────────────────────────────────────────────────────────────

    public async Task<SessionHistoryDto> GetHistoryAsync(
        string sessionId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("sessionId must not be empty.", nameof(sessionId));

        var db = _redis.GetDatabase();
        var key = SessionKey(sessionId);

        RedisValue[] raw;
        try
        {
            // LRANGE 0 -1 → all items; list is stored newest-first (LPUSH), so reverse for chronological order
            raw = await db.ListRangeAsync(key, 0, -1);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ChatMemory: Redis LRANGE failed for session {Session}", sessionId);
            return new SessionHistoryDto { SessionId = sessionId, WindowSize = _windowSize };
        }

        var messages = new List<ChatMessage>(raw.Length);
        foreach (var item in raw.Reverse()) // reverse: LPUSH stores newest first
        {
            try
            {
                var msg = JsonSerializer.Deserialize<ChatMessage>(item.ToString());
                if (msg is not null) messages.Add(msg);
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "ChatMemory: failed to deserialise message in session {Session}", sessionId);
            }
        }

        return new SessionHistoryDto
        {
            SessionId  = sessionId,
            Messages   = messages,
            WindowSize = _windowSize
        };
    }

    // ──────────────────────────────────────────────────────────────
    // BuildPromptHistoryAsync
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Returns a compact text block such as:
    /// <code>
    /// [Conversation history]
    /// User: Hello!
    /// Assistant: Hi there!
    /// </code>
    /// Returns an empty string when the session has no history.
    /// </summary>
    public async Task<string> BuildPromptHistoryAsync(string sessionId, CancellationToken ct = default)
    {
        var history = await GetHistoryAsync(sessionId, ct);
        if (history.Messages.Count == 0) return string.Empty;

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("[Conversation history]");

        foreach (var msg in history.Messages)
        {
            var label = msg.Role switch
            {
                "assistant" => "Assistant",
                "system"    => "System",
                _           => "User"
            };
            sb.AppendLine($"{label}: {msg.Content}");
        }

        return sb.ToString().TrimEnd();
    }

    // ──────────────────────────────────────────────────────────────
    // ClearSessionAsync
    // ──────────────────────────────────────────────────────────────

    public async Task ClearSessionAsync(string sessionId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("sessionId must not be empty.", nameof(sessionId));

        var db = _redis.GetDatabase();
        var deleted = await db.KeyDeleteAsync(SessionKey(sessionId));

        _logger.LogInformation(
            "ChatMemory: session {Session} cleared (existed={Existed})", sessionId, deleted);
    }
}
