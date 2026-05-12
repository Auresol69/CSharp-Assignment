using System.ComponentModel.DataAnnotations;

namespace InteractHub_Shared.DTOs.Auth;

/// <summary>Request body cho API ÄÄƒng kÃ½ tÃ i khoáº£n</summary>
public class RegisterRequestDto
{
    [Required(ErrorMessage = "TÃªn tÃ i khoáº£n khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.")]
    [MaxLength(100)]
    public string TenTaiKhoan { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.")]
    [EmailAddress(ErrorMessage = "Äá»‹nh dáº¡ng email khÃ´ng há»£p lá»‡.")]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Äá»‹nh dáº¡ng sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡.")]
    [MaxLength(15)]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.")]
    [MinLength(6, ErrorMessage = "Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "XÃ¡c nháº­n máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.")]
    [Compare(nameof(Password), ErrorMessage = "Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

