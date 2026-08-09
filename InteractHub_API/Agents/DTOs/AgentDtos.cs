namespace InteractHub_API.Agents.DTOs;

// ═══════════════════════════════════════════════════════════════════
// Agent Chat – Request / Response
// ═══════════════════════════════════════════════════════════════════

public class AgentChatRequest
{
    /// <summary>Session ID của cuộc trò chuyện (mặc định là "default-session").</summary>
    public string SessionId { get; set; } = "default-session";

    /// <summary>Câu hỏi / yêu cầu của user bằng ngôn ngữ tự nhiên.</summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Toàn bộ pipeline Agent trả về – user nhìn thấy từng bước LLM suy luận.
/// </summary>
public class AgentChatResponse
{
    public string SessionId { get; set; } = "default-session";
    public string UserMessage { get; set; } = string.Empty;

    /// <summary>Thông tin Prompt Cache nếu câu hỏi trúng cache.</summary>
    public CacheHit? CacheHit { get; set; }

    // ── Step 1 ──
    public IntentAnalysisDto IntentAnalysis { get; set; } = new();

    // ── Step 2 ──
    public SkillExecutionDto? SkillExecution { get; set; }

    // ── Step 3 ──
    public string Answer { get; set; } = string.Empty;

    public double TotalElapsedMs { get; set; }
}

// ─── Sub DTOs ────────────────────────────────────────────────────

public class IntentAnalysisDto
{
    public string DetectedIntent { get; set; } = string.Empty;
    public string SkillName { get; set; } = string.Empty;
    public Dictionary<string, string> ExtractedParams { get; set; } = new();
    public double Confidence { get; set; }
    public string Reasoning { get; set; } = string.Empty;

    /// <summary>"llm" hoặc "rule_based" (fallback khi chưa có API key).</summary>
    public string Method { get; set; } = "rule_based";
    public string? LlmError { get; set; }
    public double ElapsedMs { get; set; }
}

public class SkillExecutionDto
{
    public string SkillName { get; set; } = string.Empty;
    public object? Input { get; set; }
    public object? Output { get; set; }
    public bool Success { get; set; }
    public string? Error { get; set; }
    public double ElapsedMs { get; set; }
}
