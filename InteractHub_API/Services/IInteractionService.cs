using InteractHub_Shared.DTOs.Interactions;

namespace InteractHub_API.Services;

/// <summary>
/// Contract cho AuthService.
/// Định nghĩa các thao tác xác thực: đăng ký, đăng nhập.
/// </summary>
public interface IInteractionService
{
    /// <summary>
    /// Đăng ký tài khoản mới.
    /// </summary>
    /// <param name="request">Thông tin đăng ký</param>
    /// <returns>AuthResponseDto chứa JWT token nếu thành công</returns>
    Task<InteractionResponseDto> CommentAsync(CommentRequest request);

    /// <summary>
    /// Đăng nhập bằng email và mật khẩu.
    /// </summary>
    /// <param name="request">Thông tin đăng nhập</param>
    /// <returns>AuthResponseDto chứa JWT token nếu thành công</returns>
    Task<InteractionResponseDto> LikeAsync(LikeRequest request);
}

