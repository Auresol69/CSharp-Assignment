namespace InteractHub_Shared.DTOs.Profiles;

public sealed class UpdateProfileRequestDto
{
    public string? TenTaiKhoan { get; set; }
    
    public string? Email { get; set; }
    
    public string? PhoneNumber { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public string? Bio { get; set; }
    
    public DateTime? NgaySinh { get; set; }
    
    public string? GioiTinh { get; set; }
    
    public string? DiaChi { get; set; }
}

