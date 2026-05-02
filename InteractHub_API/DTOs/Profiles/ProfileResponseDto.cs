namespace InteractHub_API.DTOs.Profiles;

public sealed class ProfileResponseDto
{
    public string Id { get; set; } = string.Empty;
    
    public string TenTaiKhoan { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    
    public string? PhoneNumber { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public string? Bio { get; set; }
    
    public DateTime? NgaySinh { get; set; }
    
    public string? GioiTinh { get; set; }
    
    public string? DiaChi { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public int SoLuongFollower { get; set; }
    
    public int SoLuongFollowing { get; set; }
    
    public int SoLuongPost { get; set; }
    
    public bool IsFollowing { get; set; }
    
    public bool IsOwnProfile { get; set; }
}
