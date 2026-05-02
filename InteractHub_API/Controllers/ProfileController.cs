using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Profiles;
using InteractHub_API.Services;

namespace InteractHub_API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly UserManager<ApplicationUser> _userManager;

    public ProfileController(IProfileService profileService, UserManager<ApplicationUser> userManager)
    {
        _profileService = profileService;
        _userManager = userManager;
    }

    /// <summary>
    /// Lấy thông tin profile của người dùng hiện tại
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<ProfileResponseDto>> GetMyProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var profile = await _profileService.GetProfileAsync(user.Id, user.Id);
        return Ok(profile);
    }

    /// <summary>
    /// Lấy thông tin profile của một người dùng khác
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<ProfileResponseDto>?> GetUserProfile(string userId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized();

        var profile = await _profileService.GetProfileAsync(userId, currentUser.Id);
        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    /// <summary>
    /// Cập nhật thông tin profile
    /// </summary>
    [HttpPut("me")]
    public async Task<ActionResult<ProfileResponseDto>> UpdateMyProfile([FromBody] UpdateProfileRequestDto request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var updatedProfile = await _profileService.UpdateProfileAsync(user.Id, request);
        return Ok(updatedProfile);
    }

    /// <summary>
    /// Đổi mật khẩu
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var result = await _profileService.ChangePasswordAsync(user.Id, request.CurrentPassword, request.NewPassword);
        
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Đổi mật khẩu thất bại", errors = result.Errors });
        }

        return Ok(new { message = "Đổi mật khẩu thành công" });
    }

    /// <summary>
    /// Upload avatar
    /// </summary>
    [HttpPost("upload-avatar")]
    public async Task<ActionResult<string>> UploadAvatar(IFormFile file)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn file ảnh" });

        var avatarUrl = await _profileService.UploadAvatarAsync(user.Id, file);
        return Ok(new { avatarUrl });
    }

    /// <summary>
    /// Follow/Unfollow một người dùng
    /// </summary>
    [HttpPost("{userId}/follow")]
    public async Task<ActionResult> ToggleFollow(string userId)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized();

        if (currentUser.Id == userId)
            return BadRequest(new { message = "Không thể follow chính mình" });

        var isFollowing = await _profileService.ToggleFollowAsync(currentUser.Id, userId);
        
        return Ok(new { 
            message = isFollowing ? "Đã follow người dùng" : "Đã unfollow người dùng",
            isFollowing 
        });
    }

    /// <summary>
    /// Lấy danh sách followers
    /// </summary>
    [HttpGet("{userId}/followers")]
    public async Task<ActionResult<IEnumerable<ProfileResponseDto>>> GetFollowers(string userId, [FromQuery] int page = 1, [FromQuery] int size = 20)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized();

        var followers = await _profileService.GetFollowersAsync(userId, currentUser.Id, page, size);
        return Ok(followers);
    }

    /// <summary>
    /// Lấy danh sách following
    /// </summary>
    [HttpGet("{userId}/following")]
    public async Task<ActionResult<IEnumerable<ProfileResponseDto>>> GetFollowing(string userId, [FromQuery] int page = 1, [FromQuery] int size = 20)
    {
        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
            return Unauthorized();

        var following = await _profileService.GetFollowingAsync(userId, currentUser.Id, page, size);
        return Ok(following);
    }
}
