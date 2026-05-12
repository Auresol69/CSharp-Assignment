namespace InteractHub_Shared.DTOs.Auth;

/// <summary>Response tráº£ vá» sau khi ÄÄƒng kÃ½ / ÄÄƒng nháº­p thÃ nh cÃ´ng</summary>
public class AuthResponseDto
{
    /// <summary>JWT Access Token</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Thá»i Ä‘iá»ƒm token háº¿t háº¡n (UTC)</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>ThÃ´ng tin cÆ¡ báº£n cá»§a ngÆ°á»i dÃ¹ng</summary>
    public UserInfoDto User { get; set; } = new();
}

/// <summary>ThÃ´ng tin ngÆ°á»i dÃ¹ng nhÃºng trong AuthResponse</summary>
public class UserInfoDto
{
    public string Id { get; set; } = string.Empty;
    public string TenTaiKhoan { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
}

