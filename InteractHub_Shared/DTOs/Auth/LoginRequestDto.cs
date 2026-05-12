using System.ComponentModel.DataAnnotations;

namespace InteractHub_Shared.DTOs.Auth;

/// <summary>Request body cho API Đăng nhập</summary>
public class LoginRequestDto
{
    [Required(ErrorMessage = "Email không được để trống.")]
    [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    public string Password { get; set; } = string.Empty;
}