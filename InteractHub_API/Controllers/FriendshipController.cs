using System.Security.Claims;
using InteractHub_API.Services; // Giả sử service của bạn ở đây
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Chỉ cho phép người dùng đã đăng nhập gọi các API này
public class FriendshipController : ControllerBase
{
    private readonly IFriendshipService _friendshipService;

    public FriendshipController(IFriendshipService friendshipService)
    {
        _friendshipService = friendshipService;
    }

    [HttpPost("{recipientId}/request")]
    public async Task<IActionResult> SendFriendRequest(string recipientId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _friendshipService.SendFriendRequestAsync(userId, recipientId);

        if (!result) return BadRequest("Không thể gửi yêu cầu kết bạn.");
        return Ok(new { success = true, message = "Đã gửi yêu cầu kết bạn." });
    }

    [HttpPost("{senderId}/accept")]
    public async Task<IActionResult> AcceptFriendRequest(string senderId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _friendshipService.AcceptFriendRequestAsync(userId, senderId);

        if (!result) return BadRequest("Không thể chấp nhận yêu cầu kết bạn.");
        return Ok(new { success = true, message = "Hai bạn đã trở thành bạn bè." });
    }
}