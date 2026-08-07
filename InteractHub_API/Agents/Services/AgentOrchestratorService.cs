using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using InteractHub_API.Agents.DTOs;

namespace InteractHub_API.Agents.Services;

// ═══════════════════════════════════════════════════════════════════
// Agent Orchestrator – Bộ não của hệ thống
//
// Pipeline:  User message
//   → Step 1: LLM phân tích intent (hoặc rule-based fallback)
//   → Step 2: Gọi skill tương ứng
//   → Step 3: LLM tổng hợp kết quả thành câu trả lời tự nhiên
// ═══════════════════════════════════════════════════════════════════

public interface IAgentOrchestrator
{
    Task<AgentChatResponse> ProcessAsync(AgentChatRequest request, CancellationToken ct = default);
}

public class AgentOrchestratorService : IAgentOrchestrator
{
    private readonly ILlmClient _llm;
    private readonly IAnalyzePostPerformanceSkill _analyzeSkill;
    private readonly ISuggestOptimizationSkill _suggestSkill;
    private readonly IGetTrendingTopicsSkill _trendingSkill;
    private readonly ILogger<AgentOrchestratorService> _logger;

    public AgentOrchestratorService(
        ILlmClient llm,
        IAnalyzePostPerformanceSkill analyzeSkill,
        ISuggestOptimizationSkill suggestSkill,
        IGetTrendingTopicsSkill trendingSkill,
        ILogger<AgentOrchestratorService> logger)
    {
        _llm = llm;
        _analyzeSkill = analyzeSkill;
        _suggestSkill = suggestSkill;
        _trendingSkill = trendingSkill;
        _logger = logger;
    }

    // ──────────────────────────────────────────────────────────────
    // MAIN PIPELINE
    // ──────────────────────────────────────────────────────────────

    public async Task<AgentChatResponse> ProcessAsync(AgentChatRequest request, CancellationToken ct = default)
    {
        var totalSw = Stopwatch.StartNew();
        var response = new AgentChatResponse { UserMessage = request.Message };

        // ── Step 1: Intent Analysis ──
        response.IntentAnalysis = await AnalyzeIntentAsync(request.Message, ct);

        // ── Step 2: Skill Execution ──
        if (response.IntentAnalysis.DetectedIntent != "general_chat")
        {
            response.SkillExecution = await ExecuteSkillAsync(response.IntentAnalysis, ct);
        }

        // ── Step 3: Generate Answer ──
        response.Answer = await GenerateAnswerAsync(
            request.Message,
            response.IntentAnalysis,
            response.SkillExecution,
            ct);

        totalSw.Stop();
        response.TotalElapsedMs = totalSw.Elapsed.TotalMilliseconds;
        return response;
    }

    // ──────────────────────────────────────────────────────────────
    // STEP 1: Intent Analysis
    // ──────────────────────────────────────────────────────────────

    private async Task<IntentAnalysisDto> AnalyzeIntentAsync(string message, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        // Nếu LLM sẵn sàng → dùng LLM, nếu không → rule-based fallback
        IntentAnalysisDto result;
        if (_llm.IsConfigured)
        {
            result = await AnalyzeIntentWithLlmAsync(message, ct);
            result.Method = "llm";
        }
        else
        {
            result = AnalyzeIntentRuleBased(message);
            result.Method = "rule_based";
            _logger.LogWarning("LLM chưa cấu hình → dùng rule-based intent detection.");
        }

        sw.Stop();
        result.ElapsedMs = sw.Elapsed.TotalMilliseconds;
        return result;
    }

    private async Task<IntentAnalysisDto> AnalyzeIntentWithLlmAsync(string message, CancellationToken ct)
    {
        const string systemPrompt = """
            Ban la bo phan tich intent cho InteractHub — mot nen tang mang xa hoi.
            Phan tich tin nhan cua nguoi dung va xac dinh skill phu hop.

            CAC SKILL CO SAN:
            1. "analyze_post_performance" — Phan tich hieu suat bai viet (likes, comments, reposts, engagement)
               Tham so bat buoc: postId (string — UUID hoac ID bat ky ma user de cap)
            2. "suggest_optimization" — Goi y cai thien noi dung bai viet
               Tham so bat buoc: postContent (string — noi dung bai viet ma user muon toi uu)
               Tham so tuy chon: language (string, mac dinh "vi")
            3. "get_trending_topics" — Xem cac chu de dang hot/trending
               Tham so tuy chon:
                 - category (string, mac dinh "global")
                 - limit (so nguyen, mac dinh 10)
                   Cach nhan biet limit tu cau noi tu nhien:
                   * "top 5", "5 trending", "lay 5", "cho toi 5", "5 hashtag"     → limit = 5
                   * "3 chu de", "liet ke 3", "top 3"                              → limit = 3
                   * "20 topics", "hien 20"                                         → limit = 20
                   Neu khong de cap so luong cu the, de limit = 10 (mac dinh).
            4. "general_chat" — Hoi thoai thong thuong, khong can skill nao.

            Tra ve DUY NHAT JSON (khong markdown, khong giai thich them):
            {
              "intent": "<ten_skill>",
              "params": { ... cac tham so trich xuat duoc ... },
              "confidence": <0.0 den 1.0>,
              "reasoning": "<giai thich ngan gon bang tieng Viet>"
            }
            """;

        try
        {
            var llmResponse = await _llm.ChatAsync(systemPrompt, message, temperature: 0.1, jsonMode: true, ct: ct);
            var json = llmResponse.Content.Trim();

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var intent = root.GetProperty("intent").GetString() ?? "general_chat";
            var confidence = root.TryGetProperty("confidence", out var conf) ? conf.GetDouble() : 0.5;
            var reasoning = root.TryGetProperty("reasoning", out var reas) ? reas.GetString() ?? "" : "";

            var extractedParams = new Dictionary<string, string>();
            if (root.TryGetProperty("params", out var paramsProp) && paramsProp.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in paramsProp.EnumerateObject())
                {
                    extractedParams[prop.Name] = prop.Value.ToString();
                }
            }

            return new IntentAnalysisDto
            {
                DetectedIntent = intent,
                SkillName = MapIntentToSkillName(intent),
                ExtractedParams = extractedParams,
                Confidence = confidence,
                Reasoning = reasoning
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LLM intent analysis failed → fallback rule-based");
            var fallback = AnalyzeIntentRuleBased(message);
            fallback.Reasoning += " [LLM lỗi → dùng rule-based]";
            fallback.LlmError = ex.Message;
            return fallback;
        }
    }

    private IntentAnalysisDto AnalyzeIntentRuleBased(string message)
    {
        var lower = message.ToLowerInvariant();
        var extractedParams = new Dictionary<string, string>();

        // Tìm UUID pattern trong message
        var uuidMatch = Regex.Match(message, @"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

        // ── analyze_post_performance ──
        if (ContainsAny(lower, "phân tích", "analyze", "hiệu suất", "performance", "metrics", "thống kê", "engagement"))
        {
            if (uuidMatch.Success)
                extractedParams["postId"] = uuidMatch.Value;

            return new IntentAnalysisDto
            {
                DetectedIntent = "analyze_post_performance",
                SkillName = "AnalyzePostPerformance",
                ExtractedParams = extractedParams,
                Confidence = uuidMatch.Success ? 0.85 : 0.6,
                Reasoning = "Phát hiện từ khoá liên quan đến phân tích hiệu suất bài viết."
            };
        }

        // ── suggest_optimization ──
        if (ContainsAny(lower, "gợi ý", "cải thiện", "optimize", "tối ưu", "viết lại", "suggest", "caption"))
        {
            // Cố gắng lấy nội dung sau dấu ":"
            var colonIdx = message.IndexOf(':');
            if (colonIdx >= 0 && colonIdx < message.Length - 1)
                extractedParams["postContent"] = message[(colonIdx + 1)..].Trim();

            return new IntentAnalysisDto
            {
                DetectedIntent = "suggest_optimization",
                SkillName = "SuggestOptimization",
                ExtractedParams = extractedParams,
                Confidence = extractedParams.ContainsKey("postContent") ? 0.8 : 0.6,
                Reasoning = "Phát hiện từ khoá liên quan đến gợi ý tối ưu nội dung."
            };
        }

        // ── get_trending_topics ──
        if (ContainsAny(lower, "trending", "xu hướng", "hot", "hashtag", "trend", "nổi bật", "phổ biến"))
        {
            // Extract numeric limit from natural language:
            // e.g. "top 5", "lấy 3 trending", "cho tôi 10 hashtag", "5 xu hướng"
            var limitMatch = Regex.Match(message, @"\b(\d+)\b");
            if (limitMatch.Success && int.TryParse(limitMatch.Groups[1].Value, out var parsedLimit) && parsedLimit > 0)
            {
                extractedParams["limit"] = parsedLimit.ToString();
            }

            return new IntentAnalysisDto
            {
                DetectedIntent = "get_trending_topics",
                SkillName = "GetTrendingTopics",
                ExtractedParams = extractedParams,
                Confidence = 0.8,
                Reasoning = limitMatch.Success
                    ? $"Phát hiện từ khoá trending và số lượng limit={extractedParams["limit"]}."
                    : "Phát hiện từ khoá liên quan đến trending/xu hướng, dùng limit mặc định."
            };
        }

        // ── general_chat ──
        return new IntentAnalysisDto
        {
            DetectedIntent = "general_chat",
            SkillName = "(none)",
            Confidence = 0.5,
            Reasoning = "Không khớp skill nào cụ thể → xử lý như hội thoại thông thường."
        };
    }

    // ──────────────────────────────────────────────────────────────
    // STEP 2: Skill Execution
    // ──────────────────────────────────────────────────────────────

    private async Task<SkillExecutionDto> ExecuteSkillAsync(IntentAnalysisDto intent, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var result = new SkillExecutionDto { SkillName = intent.SkillName };

        try
        {
            switch (intent.DetectedIntent)
            {
                case "analyze_post_performance":
                {
                    var postId = intent.ExtractedParams.GetValueOrDefault("postId", "");
                    if (string.IsNullOrWhiteSpace(postId))
                    {
                        result.Success = false;
                        result.Error = "Thiếu postId. Vui lòng cung cấp ID bài viết (UUID).";
                        break;
                    }
                    result.Input = new { postId };
                    var output = await _analyzeSkill.ExecuteAsync(postId);
                    result.Output = output;
                    result.Success = true;
                    break;
                }

                case "suggest_optimization":
                {
                    var postContent = intent.ExtractedParams.GetValueOrDefault("postContent", "");
                    if (string.IsNullOrWhiteSpace(postContent))
                    {
                        result.Success = false;
                        result.Error = "Thiếu nội dung bài viết. Vui lòng cung cấp nội dung cần tối ưu.";
                        break;
                    }
                    var language = intent.ExtractedParams.GetValueOrDefault("language", "vi");
                    result.Input = new { postContent, language };
                    var output = await _suggestSkill.ExecuteAsync(postContent, null, language);
                    result.Output = output;
                    result.Success = true;
                    break;
                }

                case "get_trending_topics":
                {
                    var category = intent.ExtractedParams.GetValueOrDefault("category", "global");
                    int.TryParse(intent.ExtractedParams.GetValueOrDefault("limit", "10"), out var limit);
                    if (limit <= 0) limit = 10;
                    result.Input = new { category, limit };
                    var output = await _trendingSkill.ExecuteAsync(category, limit);
                    result.Output = output;
                    result.Success = true;
                    break;
                }

                default:
                    result.Success = false;
                    result.Error = $"Không tìm thấy skill: {intent.DetectedIntent}";
                    break;
            }
        }
        catch (KeyNotFoundException ex)
        {
            result.Success = false;
            result.Error = ex.Message;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Skill execution failed: {Skill}", intent.DetectedIntent);
            result.Success = false;
            result.Error = $"Lỗi khi chạy skill: {ex.Message}";
        }

        sw.Stop();
        result.ElapsedMs = sw.Elapsed.TotalMilliseconds;
        return result;
    }

    // ──────────────────────────────────────────────────────────────
    // STEP 3: Generate natural language answer
    // ──────────────────────────────────────────────────────────────

    private async Task<string> GenerateAnswerAsync(
        string userMessage,
        IntentAnalysisDto intent,
        SkillExecutionDto? execution,
        CancellationToken ct)
    {
        try
        {
            // Nếu general_chat → trả lời generic bằng LLM (hoặc fallback nếu lỗi)
            if (intent.DetectedIntent == "general_chat")
            {
                if (_llm.IsConfigured)
                {
                    try
                    {
                        var resp = await _llm.ChatAsync(
                            "Bạn là trợ lý AI của InteractHub. Trả lời ngắn gọn, hữu ích, bằng tiếng Việt.",
                            userMessage, ct: ct);
                        return resp.Content;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "LLM chat failed for general_chat -> using fallback");
                    }
                }
                return "Xin chào! Tôi là trợ lý InteractHub. Bạn có thể hỏi tôi về: phân tích bài viết, gợi ý tối ưu nội dung, hoặc xem chủ đề trending.";
            }

            // Nếu skill lỗi → trả lời lỗi
            if (execution is not { Success: true })
            {
                return $"⚠️ Không thể thực hiện: {execution?.Error ?? "Lỗi không xác định"}";
            }

            // Nếu có LLM → gọi LLM tổng hợp kết quả
            if (_llm.IsConfigured)
            {
                var skillResultJson = JsonSerializer.Serialize(execution.Output, new JsonSerializerOptions
                {
                    WriteIndented = false,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var systemPrompt = """
                    Bạn là trợ lý AI của InteractHub. Dựa vào câu hỏi của user và kết quả skill, 
                    hãy tổng hợp thành câu trả lời tự nhiên bằng tiếng Việt.
                    Trả lời ngắn gọn, dễ hiểu, có emoji phù hợp. Đề cập số liệu cụ thể.
                    """;

                var contextMessage = $"Câu hỏi: {userMessage}\n\nKết quả skill [{intent.SkillName}]:\n{skillResultJson}";

                try
                {
                    var resp = await _llm.ChatAsync(systemPrompt, contextMessage, temperature: 0.5, ct: ct);
                    return resp.Content;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "LLM answer generation failed → template fallback");
                }
            }

            // Fallback: template-based answer
            return GenerateTemplateAnswer(intent, execution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating answer");
            return "Đã hoàn thành yêu cầu.";
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────

    private static string GenerateTemplateAnswer(IntentAnalysisDto intent, SkillExecutionDto execution)
    {
        return intent.DetectedIntent switch
        {
            "analyze_post_performance" =>
                $"📊 Đã phân tích bài viết thành công. Xem chi tiết trong mục `skillExecution.output`.",
            "suggest_optimization" =>
                $"💡 Đã tạo gợi ý tối ưu. Xem chi tiết trong mục `skillExecution.output`.",
            "get_trending_topics" =>
                $"🔥 Đã lấy danh sách trending. Xem chi tiết trong mục `skillExecution.output`.",
            _ => "✅ Đã xử lý xong."
        };
    }

    private static string MapIntentToSkillName(string intent) => intent switch
    {
        "analyze_post_performance" => "AnalyzePostPerformance",
        "suggest_optimization" => "SuggestOptimization",
        "get_trending_topics" => "GetTrendingTopics",
        _ => "(none)"
    };

    private static bool ContainsAny(string text, params string[] keywords)
        => keywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
}
