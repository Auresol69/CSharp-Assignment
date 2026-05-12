using System.ComponentModel.DataAnnotations;

namespace InteractHub_Shared.DTOs.Auth;

/// <summary>Request body cho API ÄÄƒng nháº­p</summary>
public class LoginRequestDto
{
    [Required(ErrorMessage = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.")]
    [EmailAddress(ErrorMessage = "Äá»‹nh dáº¡ng email khÃ´ng há»£p lá»‡.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.")]
    public string Password { get; set; } = string.Empty;
}

