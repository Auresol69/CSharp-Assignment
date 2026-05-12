namespace InteractHub_Shared.DTOs.Auth;

/// <summary>Response trả về sau khi Đăng ký / Đăng nhập thành công</summary>
public class AuthResponseDto
{
    /// <summary>JWT Access Token</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Thời điểm token hết hạn (UTC)</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Thông tin cơ bản của người dùng</summary>
    public UserInfoDto User { get; set; } = new();
}

/// <summary>Thông tin người dùng nhúng trong AuthResponse</summary>
public class UserInfoDto
{
    public string Id { get; set; } = string.Empty;
    public string TenTaiKhoan { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
}