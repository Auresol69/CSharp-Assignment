using InteractHub_API.Agents.DTOs;
using InteractHub_API.Agents.Services;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

/// <summary>
/// Agent Controller – Endpoint duy nhất để chat với AI Agent.
/// User gửi tin nhắn tự nhiên → Agent phân tích intent → gọi skill → trả lời.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AgentController : ControllerBase
{
    private readonly IAgentOrchestrator _orchestrator;
    private readonly ILogger<AgentController> _logger;

    public AgentController(IAgentOrchestrator orchestrator, ILogger<AgentController> logger)
    {
        _orchestrator = orchestrator;
        _logger = logger;
    }

    /// <summary>
    /// Gửi tin nhắn cho AI Agent. Agent sẽ tự phân tích intent,
    /// chọn skill phù hợp, thực thi, và trả kết quả.
    /// Response hiển thị toàn bộ pipeline (intent → skill → answer).
    /// </summary>
    [HttpPost("chat")]
    [ProducesResponseType(typeof(AgentChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Chat([FromBody] AgentChatRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message không được để trống." });

        try
        {
            _logger.LogInformation("Agent chat: \"{Message}\"", request.Message);
            var response = await _orchestrator.ProcessAsync(request, ct);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Agent chat error");
            return StatusCode(500, new { error = "Agent gặp lỗi khi xử lý yêu cầu." });
        }
    }
}
