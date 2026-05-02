namespace InteractHub_API.DTOs.Notifications;

public class NotificationResponseDto
{
    public string IdNotification { get; set; } = string.Empty;
    public string? IdPost { get; set; }
    public string? Type { get; set; }
    public bool IsRead { get; set; }
    public string? TriggeredByUserName { get; set; }
    public string? TriggeredByAvatarUrl { get; set; }
    public string? Message { get; set; }
}
