using System.Security.Claims;
using InteractHub_Shared.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int take = 100)
    {
        var userId = GetUserId();
        var data = await _notificationService.GetUserNotificationsAsync(userId, take);
        return Ok(data);
    }

    [HttpPatch("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(string notificationId)
    {
        var userId = GetUserId();
        var updated = await _notificationService.MarkAsReadAsync(notificationId, userId);
        if (!updated)
        {
            return NotFound(new { message = "Không tìm thấy thông báo." });
        }

        return Ok(new { message = "Đã đánh dấu đã đọc." });
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        var count = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new { message = "Đã đánh dấu tất cả thông báo đã đọc.", updatedCount = count });
    }

    [HttpDelete("{notificationId}")]
    public async Task<IActionResult> DeleteNotification(string notificationId)
    {
        var userId = GetUserId();
        var deleted = await _notificationService.DeleteNotificationAsync(notificationId, userId);
        if (!deleted)
        {
            return NotFound(new { message = "Không tìm thấy thông báo." });
        }

        return Ok(new { message = "Đã xóa thông báo." });
    }

    private string GetUserId()
    {
        var userId = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException("Không xác định được người dùng hiện tại.");
        }

        return userId;
    }
}
