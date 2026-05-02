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

            var postDto = new PostResponseDto
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
                RepostsCount = post.Reposts?.Count ?? 0
            };

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
    public async Task<IActionResult> Repost(string postId, [FromBody] DTOs.Posts.RepostRequestDto request)
    {
        try
        {
            var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            var repost = await _postService.RepostAsync(userId ?? string.Empty, postId, request.Content);

            var repostDto = new PostResponseDto
            {
                IdPost = repost.IdPost,
                Content = repost.Content,
                CreatedAt = repost.CreatedAt,
                ParentPostId = repost.ParentPostId,
                TaiKhoan = repost.TaiKhoan != null ? new UserResponseDto
                {
                    Id = repost.TaiKhoan.Id,
                    TenTaiKhoan = repost.TaiKhoan.TenTaiKhoan,
                    AvatarUrl = repost.TaiKhoan.AvatarUrl
                } : null,
                Media = repost.PostMedias?.Select(m => new PostMediaDto
                {
                    Id = m.Id,
                    Url = m.Url ?? string.Empty,
                    MediaType = m.MediaType.ToString()
                }).ToList() ?? new(),
                LikesCount = repost.Likes?.Count ?? 0,
                CommentsCount = repost.Comments?.Count ?? 0,
                RepostsCount = repost.Reposts?.Count ?? 0
            };

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

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] DateTime? lastTimestamp, [FromQuery] int limit = 10)
    {
        var posts = await _postService.GetPostsAsync(lastTimestamp, limit);

        // Map entities to DTOs to avoid Object Cycle
        var postDtos = posts.Select(p => new PostResponseDto
        {
            IdPost = p.IdPost,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            ParentPostId = p.ParentPostId,
            TaiKhoan = p.TaiKhoan != null ? new UserResponseDto
            {
                Id = p.TaiKhoan.Id,
                TenTaiKhoan = p.TaiKhoan.TenTaiKhoan,
                AvatarUrl = p.TaiKhoan.AvatarUrl
            } : null,
            Media = p.PostMedias?.Select(m => new PostMediaDto
            {
                Id = m.Id,
                Url = m.Url ?? string.Empty,
                MediaType = m.MediaType.ToString()
            }).ToList() ?? new(),
            LikesCount = p.Likes?.Count ?? 0,
            CommentsCount = p.Comments?.Count ?? 0,
            RepostsCount = p.Reposts?.Count ?? 0
        }).ToList();

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
}
