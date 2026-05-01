namespace InteractHub_API.DTOs.Interactions;

/// <summary>Response trả về sau khi Đăng ký / Đăng nhập thành công</summary>
public class InteractionResponseDto
{
    public bool isSuccess = false;
    public string? Message;
}