using System.Security.Claims;
using InteractHub_Shared.DTOs.Posts;
using InteractHub_API.Services;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Interactions;
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
    private readonly IReportService _reportService;
    private readonly ILogger<PostController> _logger;

    public PostController(IPostService postService, IReportService reportService, ILogger<PostController> logger)
    {
        _postService = postService;
        _reportService = reportService;
        _logger = logger;
    }

    [HttpGet("{postId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string postId)
    {
        try
        {
            var post = await _postService.GetPostByIdAsync(postId);
            return Ok(MapPostDetail(post));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
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

            var postDto = MapPostToResponse(post);

            return Created($"/api/posts/{post.IdPost}", postDto);
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

    [HttpPost("{postId}/repost")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Repost(string postId, [FromBody] RepostRequestDto request)
    {
        try
        {
            var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            var repost = await _postService.RepostAsync(userId ?? string.Empty, postId, request.Content);

            var repostDto = MapPostToResponse(repost);

            return Created($"/api/posts/{repost.IdPost}", repostDto);
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex is KeyNotFoundException)
        {
            _logger.LogWarning(ex, "Repost failed.");
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("{postId}/report")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Report(string postId, [FromBody] ReportPostRequestDto request)
    {
        try
        {
            var reporterId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _reportService.ReportPostAsync(postId, request.Reason ?? string.Empty, reporterId ?? string.Empty);

            return Ok(new { message = "Đã gửi báo cáo." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] DateTime? lastTimestamp, [FromQuery] int limit = 10)
    {
        var posts = await _postService.GetPostsAsync(lastTimestamp, limit);

        // Map entities to DTOs to avoid Object Cycle
        var postDtos = posts.Select(MapPostToResponse).ToList();

        var nextTimestamp = posts.Any()
            ? posts.Last().CreatedAt
            : (DateTime?)null;

        return Ok(new
        {
            data = postDtos,
            nextTimestamp = nextTimestamp,
            hasMore = posts.Count == limit
        });
    }

    private static PostResponseDto MapPostToResponse(Post post)
    {
        return new PostResponseDto
        {
            IdPost = post.IdPost,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            ParentPostId = post.ParentPostId,
            TaiKhoan = post.TaiKhoan != null ? new UserResponseDto
            {
                Id = post.TaiKhoan.Id,
                TenTaiKhoan = post.TaiKhoan.TenTaiKhoan,
                AvatarUrl = post.TaiKhoan.AvatarUrl
            } : null,
            Media = post.PostMedias?.Select(m => new PostMediaDto
            {
                Id = m.Id,
                Url = m.Url ?? string.Empty,
                MediaType = m.MediaType.ToString()
            }).ToList() ?? new(),
            ParentPost = post.ParentPost != null ? MapPostToResponse(post.ParentPost) : null,
            LikesCount = post.Likes?.Count ?? 0,
            CommentsCount = post.Comments?.Count ?? 0,
            RepostsCount = post.Reposts?.Count ?? 0
        };
    }

    private static PostDetailResponseDto MapPostDetail(Post post)
    {
        return new PostDetailResponseDto
        {
            IdPost = post.IdPost,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            ParentPostId = post.ParentPostId,
            TaiKhoan = post.TaiKhoan != null ? new UserResponseDto
            {
                Id = post.TaiKhoan.Id,
                TenTaiKhoan = post.TaiKhoan.TenTaiKhoan,
                AvatarUrl = post.TaiKhoan.AvatarUrl
            } : null,
            Media = post.PostMedias?.Select(m => new PostMediaDto
            {
                Id = m.Id,
                Url = m.Url ?? string.Empty,
                MediaType = m.MediaType.ToString()
            }).ToList() ?? new(),
            LikesCount = post.Likes?.Count ?? 0,
            CommentsCount = post.Comments?.Count ?? 0,
            RepostsCount = post.Reposts?.Count ?? 0,
            Comments = post.Comments
                .Where(c => c.ParentCommentId == null)
                .OrderBy(c => c.CreatedAt)
                .Select(MapComment)
                .ToList()
        };
    }

    private static CommentResponseDto MapComment(Comment comment)
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

