using System.Security.Claims;
using InteractHub_API.DTOs.Posts;
using InteractHub_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class PostController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly ILogger<PostController> _logger;

    public PostController(IPostService postService, ILogger<PostController> logger)
    {
        _postService = postService;
        _logger = logger;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromForm] CreatePostRequestDto request)
    {
        try
        {
            var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var post = await _postService.CreatePostAsync(userId ?? string.Empty, request);

            return Created($"/api/posts/{post.IdPost}", new
            {
                post.IdPost,
                post.Content,
                MediaUrls = post.PostMedias.Select(media => media.Url).ToArray()
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Tạo post thất bại.");
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpDelete("{postId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string postId)
    {
        try
        {
            await _postService.DeletePostAsync(postId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
