using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Profiles;
using InteractHub_Shared.Hubs;

namespace InteractHub_API.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMediaService _mediaService;
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;

    public ProfileService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        IMediaService mediaService,
        IHubContext<NotificationHub, INotificationClient> hubContext)
    {
        _context = context;
        _userManager = userManager;
        _mediaService = mediaService;
        _hubContext = hubContext;
    }

    public async Task<ProfileResponseDto?> GetProfileAsync(string userId, string currentUserId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return null;

        // Lấy số lượng followers, following, posts
        var followersCount = await _context.Friendships
            .CountAsync(f => f.IdNguoiNhan == userId && f.TrangThai == "Accepted");

        var followingCount = await _context.Friendships
            .CountAsync(f => f.IdNguoiGui == userId && f.TrangThai == "Accepted");

        var postsCount = await _context.Posts
            .CountAsync(p => p.IdTaiKhoan == userId);

        // Kiểm tra xem current user có follow user này không
        var isFollowing = false;
        if (currentUserId != userId)
        {
            isFollowing = await _context.Friendships
                .AnyAsync(f => f.IdNguoiGui == currentUserId && f.IdNguoiNhan == userId && f.TrangThai == "Accepted");
        }

        return new ProfileResponseDto
        {
            Id = user.Id,
            TenTaiKhoan = user.TenTaiKhoan ?? string.Empty,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            NgaySinh = user.NgaySinh,
            GioiTinh = user.GioiTinh,
            DiaChi = user.DiaChi,
            CreatedAt = user.CreatedAt ?? DateTime.UtcNow,
            SoLuongFollower = followersCount,
            SoLuongFollowing = followingCount,
            SoLuongPost = postsCount,
            IsFollowing = isFollowing,
            IsOwnProfile = currentUserId == userId
        };
    }

    public async Task<ProfileResponseDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        // Cập nhật thông tin cơ bản
        if (!string.IsNullOrEmpty(request.TenTaiKhoan))
            user.TenTaiKhoan = request.TenTaiKhoan;

        if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
        {
            var emailResult = await _userManager.SetEmailAsync(user, request.Email);
            if (!emailResult.Succeeded)
                throw new Exception("Failed to update email");
        }

        if (!string.IsNullOrEmpty(request.PhoneNumber))
            user.PhoneNumber = request.PhoneNumber;

        user.AvatarUrl = request.AvatarUrl;
        user.Bio = request.Bio;
        user.NgaySinh = request.NgaySinh;
        user.GioiTinh = request.GioiTinh;
        user.DiaChi = request.DiaChi;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new Exception("Failed to update profile");

        return await GetProfileAsync(userId, userId) ?? throw new Exception("Failed to get updated profile");
    }

    public async Task<IdentityResult> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        return await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
    }

    public async Task<string> UploadAvatarAsync(string userId, IFormFile file)
    {
        // Validate file
        if (!file.ContentType.StartsWith("image/"))
            throw new Exception("File must be an image");

        if (file.Length > 5 * 1024 * 1024) // 5MB
            throw new Exception("File size must be less than 5MB");

        // Upload to Cloudinary
        var uploadResult = await _mediaService.UploadMediaAsync(file, $"avatars/{userId}");

        // Update user avatar URL
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        user.AvatarUrl = uploadResult.Url;
        await _userManager.UpdateAsync(user);

        return uploadResult.Url;
    }

    public async Task<bool> ToggleFollowAsync(string followerId, string followingId)
    {
        var existingFollow = await _context.Friendships
            .FirstOrDefaultAsync(f => f.IdNguoiGui == followerId && f.IdNguoiNhan == followingId);

        if (existingFollow != null)
        {
            // Unfollow
            _context.Friendships.Remove(existingFollow);
            await _context.SaveChangesAsync();
            return false;
        }
        else
        {
            // Follow
            var friendship = new Friendship
            {
                IdNguoiGui = followerId,
                IdNguoiNhan = followingId,
                TrangThai = "Accepted"
            };
            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<IEnumerable<ProfileResponseDto>> GetFollowersAsync(string userId, string currentUserId, int page, int size)
    {
        var followers = await _context.Friendships
            .Where(f => f.IdNguoiNhan == userId && f.TrangThai == "Accepted")
            .Skip((page - 1) * size)
            .Take(size)
            .Select(f => f.NguoiGui.Id)
            .ToListAsync();

        var profiles = new List<ProfileResponseDto>();
        foreach (var followerId in followers)
        {
            var profile = await GetProfileAsync(followerId, currentUserId);
            if (profile != null)
                profiles.Add(profile);
        }

        return profiles;
    }

    public async Task<IEnumerable<ProfileResponseDto>> GetFollowingAsync(string userId, string currentUserId, int page, int size)
    {
        var following = await _context.Friendships
            .Where(f => f.IdNguoiGui == userId && f.TrangThai == "Accepted")
            .Skip((page - 1) * size)
            .Take(size)
            .Select(f => f.NguoiNhan.Id)
            .ToListAsync();

        var profiles = new List<ProfileResponseDto>();
        foreach (var followingId in following)
        {
            var profile = await GetProfileAsync(followingId, currentUserId);
            if (profile != null)
                profiles.Add(profile);
        }

        return profiles;
    }
}

