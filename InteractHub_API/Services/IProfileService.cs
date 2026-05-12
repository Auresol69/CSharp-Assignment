using Microsoft.AspNetCore.Identity;
using InteractHub_Shared.DTOs.Profiles;

namespace InteractHub_API.Services;

public interface IProfileService
{
    Task<ProfileResponseDto?> GetProfileAsync(string userId, string currentUserId);
    Task<ProfileResponseDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto request);
    Task<IdentityResult> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<string> UploadAvatarAsync(string userId, IFormFile file);
    Task<bool> ToggleFollowAsync(string followerId, string followingId);
    Task<IEnumerable<ProfileResponseDto>> GetFollowersAsync(string userId, string currentUserId, int page, int size);
    Task<IEnumerable<ProfileResponseDto>> GetFollowingAsync(string userId, string currentUserId, int page, int size);
}

