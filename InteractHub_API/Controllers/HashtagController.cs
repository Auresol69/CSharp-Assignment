using InteractHub_Shared.DTOs.Posts;
using InteractHub_API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class HashtagController : ControllerBase
{
    private readonly IHashtagService _hashtagService;
    private readonly ILogger<HashtagController> _logger;

    public HashtagController(IHashtagService hashtagService, ILogger<HashtagController> logger)
    {
        _hashtagService = hashtagService;
        _logger = logger;
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] string filterType = "daily", [FromQuery] int take = 10)
    {
        try
        {
            var hashtags = await _hashtagService.GetTopHashtagsAsync(filterType, take);
            return Ok(new { filterType, data = hashtags });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{hashtag}/posts")]
    public async Task<IActionResult> GetPostsByHashtag(string hashtag, [FromQuery] DateTime? lastTimestamp, [FromQuery] int take = 10)
    {
        try
        {
            var posts = await _hashtagService.GetPostsByHashtagAsync(hashtag, lastTimestamp, take);

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

            return Ok(new
            {
                hashtag,
                data = postDtos,
                nextTimestamp = posts.Any() ? posts.Last().CreatedAt : (DateTime?)null,
                hasMore = posts.Count == take
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
