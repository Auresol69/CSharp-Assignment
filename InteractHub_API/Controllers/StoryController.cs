using System.Security.Claims;
using InteractHub_API.DTOs.Stories;
using InteractHub_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class StoryController : ControllerBase
{
    private readonly IStoryService _storyService;
    private readonly ILogger<StoryController> _logger;

    public StoryController(IStoryService storyService, ILogger<StoryController> logger)
    {
        _storyService = storyService;
        _logger = logger;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromForm] CreateStoryRequestDto request)
    {
        try
        {
            var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var story = await _storyService.CreateStoryAsync(userId ?? string.Empty, request);

            return Created($"/api/stories/{story.IdStory}", new
            {
                story.IdStory,
                story.Caption,
                story.MediaUrl,
                story.ExpiresAt
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Tạo story thất bại.");
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpDelete("{storyId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string storyId)
    {
        try
        {
            await _storyService.DeleteStoryAsync(storyId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
