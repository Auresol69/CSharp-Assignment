using System.Security.Claims;
using InteractHub_API.DTOs.Interactions;
using InteractHub_API.Services;
using InteractHub_API.DTOs.Posts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(ICommentService commentService, ILogger<CommentsController> logger)
    {
        _commentService = commentService;
        _logger = logger;
    }

    [HttpGet("post/{postId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByPost(string postId)
    {
        try
        {
            var comments = await _commentService.GetCommentsByPostAsync(postId);
            var commentDtos = comments
                .Where(c => c.ParentCommentId == null)
                .OrderBy(c => c.CreatedAt)
                .Select(MapComment)
                .ToList();

            return Ok(new { postId, data = commentDtos });
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

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CommentRequest request)
    {
        try
        {
            var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _commentService.CreateCommentAsync(userId ?? string.Empty, request.IdPost ?? string.Empty, request.Content);

            return Created($"/api/comments/{comment.IdComment}", new { comment.IdComment, comment.Content, comment.IdPost });
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex is KeyNotFoundException)
        {
            _logger.LogWarning(ex, "Create comment failed.");
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("{parentCommentId}/reply")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reply(string parentCommentId, [FromBody] RecommentRequest request)
    {
        try
        {
            var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var reply = await _commentService.RecommentAsync(userId ?? string.Empty, request.IdPost ?? string.Empty, parentCommentId, request.Content);

            return Created($"/api/comments/{reply.IdComment}", new { reply.IdComment, reply.Content, reply.ParentCommentId });
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex is KeyNotFoundException)
        {
            _logger.LogWarning(ex, "Reply failed.");
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    private static CommentResponseDto MapComment(Data.Entities.Comment comment)
    {
        return new CommentResponseDto
        {
            IdComment = comment.IdComment,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            ParentCommentId = comment.ParentCommentId,
            TaiKhoan = comment.TaiKhoan != null ? new UserResponseDto
            {
                Id = comment.TaiKhoan.Id,
                TenTaiKhoan = comment.TaiKhoan.TenTaiKhoan,
                AvatarUrl = comment.TaiKhoan.AvatarUrl
            } : null,
            Replies = comment.Replies?.OrderBy(r => r.CreatedAt).Select(MapComment).ToList() ?? new()
        };
    }
}
