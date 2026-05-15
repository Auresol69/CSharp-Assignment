using System.Security.Claims;
using InteractHub_Shared.DTOs.Stories;
using InteractHub_API.Services;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Posts;
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

    [HttpGet("global")]
    public async Task<IActionResult> GetGlobal([FromQuery] int take = 20)
    {
        var stories = await _storyService.GetGlobalStoriesAsync(take);
        return Ok(new
        {
            data = stories.Select(MapStoryDto).ToList(),
            hasMore = stories.Count == take
        });
    }

    [HttpGet("local")]
    public async Task<IActionResult> GetLocal([FromQuery] int take = 20)
    {
        var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        var stories = await _storyService.GetLocalStoriesAsync(userId ?? string.Empty, take);

        return Ok(new
        {
            data = stories.Select(MapStoryDto).ToList(),
            hasMore = stories.Count == take
        });
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

    private static StoryResponseDto MapStoryDto(Story story)
    {
        return new StoryResponseDto
        {
            IdStory = story.IdStory,
            Caption = story.Caption,
            MediaUrl = story.MediaUrl,
            MediaType = story.MediaType.ToString(),
            CreatedAt = story.CreatedAt,
            ExpiresAt = story.ExpiresAt,
            TaiKhoan = story.TaiKhoan != null ? new UserResponseDto
            {
                Id = story.TaiKhoan.Id,
                TenTaiKhoan = story.TaiKhoan.TenTaiKhoan,
                AvatarUrl = story.TaiKhoan.AvatarUrl
            } : null
        };
    }
}

