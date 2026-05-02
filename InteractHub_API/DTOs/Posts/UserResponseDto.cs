namespace InteractHub_API.DTOs.Posts;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string? TenTaiKhoan { get; set; }
    public string? AvatarUrl { get; set; }
    // Chỉ trả về các thông tin công khai, không trả về PasswordHash hay Posts...
}