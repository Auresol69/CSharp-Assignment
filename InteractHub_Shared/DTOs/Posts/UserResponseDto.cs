namespace InteractHub_Shared.DTOs.Posts;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string? TenTaiKhoan { get; set; }
    public string? AvatarUrl { get; set; }
    // Chá»‰ tráº£ vá» cÃ¡c thÃ´ng tin cÃ´ng khai, khÃ´ng tráº£ vá» PasswordHash hay Posts...
}
