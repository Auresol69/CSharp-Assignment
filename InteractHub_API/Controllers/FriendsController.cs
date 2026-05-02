using InteractHub_API.Services.Friends;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/friends")]
public class FriendsController : ControllerBase
{
    private readonly FriendService _service;

    public FriendsController(FriendService service)
    {
        _service = service;
    }

    // Lấy userId từ JWT
    private string GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
    }

    // Gửi lời mời kết bạn
    [HttpPost("request/{userId}")]
    public async Task<IActionResult> SendRequest(string userId)
    {
        await _service.SendRequest(GetUserId(), userId);
        return Ok(new { message = "Đã gửi lời mời" });
    }

    // Chấp nhận lời mời
    [HttpPost("accept/{senderId}")]
    public async Task<IActionResult> Accept(string senderId)
    {
        await _service.AcceptRequest(GetUserId(), senderId);
        return Ok(new { message = "Đã chấp nhận lời mời" });
    }

    // Từ chối lời mời
    [HttpPost("reject/{senderId}")]
    public async Task<IActionResult> Reject(string senderId)
    {
        await _service.RejectRequest(GetUserId(), senderId);
        return Ok(new { message = "Đã từ chối lời mời" });
    }

    // Hủy lời mời đã gửi
    [HttpPost("cancel/{userId}")]
    public async Task<IActionResult> CancelRequest(string userId)
    {
        await _service.CancelRequest(GetUserId(), userId);
        return Ok(new { message = "Đã hủy lời mời" });
    }

    // Hủy kết bạn
    [HttpPost("unfriend/{userId}")]
    public async Task<IActionResult> Unfriend(string userId)
    {
        await _service.Unfriend(GetUserId(), userId);
        return Ok(new { message = "Đã hủy kết bạn" });
    }

    // Danh sách bạn bè
    [HttpGet("list")]
    public async Task<IActionResult> GetFriends()
    {
        var result = await _service.GetFriends(GetUserId());
        return Ok(result);
    }

    // Danh sách lời mời
    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests()
    {
        var result = await _service.GetRequests(GetUserId());
        return Ok(result);
    }

    // Gợi ý kết bạn
    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSuggestions()
    {
        var result = await _service.GetSuggestions(GetUserId());
        return Ok(result);
    }
}