using InteractHub_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/admin/moderation")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class AdminModerationController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<AdminModerationController> _logger;

    public AdminModerationController(IReportService reportService, ILogger<AdminModerationController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    [HttpGet("reported-posts")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetReportedPosts()
    {
        var posts = await _reportService.GetReportedPostsAsync();
        return Ok(posts);
    }

    [HttpGet("posts/{postId}/reports")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetReportsByPost(string postId)
    {
        try
        {
            var reports = await _reportService.GetReportsByPostAsync(postId);
            return Ok(reports);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("posts/{postId}/blacklist")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemoveFromBlacklist(string postId)
    {
        try
        {
            var removed = await _reportService.RemoveFromBlacklistAsync(postId);
            if (!removed)
            {
                return Ok(new { message = "Bài viết chưa nằm trong blacklist." });
            }

            return Ok(new { message = "Đã gỡ bài viết khỏi blacklist." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to remove post {PostId} from blacklist.", postId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Không thể gỡ blacklist lúc này." });
        }
    }

    [HttpPost("posts/{postId}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveAndDeletePost(string postId)
    {
        try
        {
            var deleted = await _reportService.ApproveAndDeletePostAsync(postId);
            if (!deleted)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Không thể xóa bài viết lúc này." });
            }

            return Ok(new { message = "Đã xóa bài viết và gỡ khỏi blacklist." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to approve/delete post {PostId}.", postId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Lỗi khi xử lý yêu cầu." });
        }
    }

    [HttpDelete("posts/{postId}/reports")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ClearReports(string postId)
    {
        try
        {
            var removedAny = await _reportService.ClearReportsAsync(postId);
            if (!removedAny)
            {
                return Ok(new { message = "Không có báo cáo nào cần xóa nhưng đã gỡ khỏi blacklist nếu có." });
            }

            return Ok(new { message = "Đã xóa các báo cáo cho bài viết này và gỡ khỏi blacklist." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear reports for post {PostId}.", postId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Lỗi khi xử lý yêu cầu." });
        }
    }
}