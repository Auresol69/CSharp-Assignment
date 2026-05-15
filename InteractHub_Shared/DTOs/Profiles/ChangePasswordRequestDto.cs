using System.ComponentModel.DataAnnotations;

namespace InteractHub_Shared.DTOs.Profiles;

public sealed class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Máº­t kháº©u má»›i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±")]
    public string NewPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "XÃ¡c nháº­n máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")]
    [Compare("NewPassword", ErrorMessage = "XÃ¡c nháº­n máº­t kháº©u khÃ´ng khá»›p")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

