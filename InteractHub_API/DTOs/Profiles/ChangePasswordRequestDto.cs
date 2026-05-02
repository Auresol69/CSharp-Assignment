using System.ComponentModel.DataAnnotations;

namespace InteractHub_API.DTOs.Profiles;

public sealed class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "Mật khẩu hiện tại không được để trống")]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
    public string NewPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
    [Compare("NewPassword", ErrorMessage = "Xác nhận mật khẩu không khớp")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
