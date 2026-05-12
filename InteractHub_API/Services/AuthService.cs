using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub_API.Services;

/// <summary>
/// Triển khai IAuthService.
/// Xử lý đăng ký, đăng nhập và tạo JWT Token.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser>   _userManager;
    private readonly RoleManager<IdentityRole>      _roleManager;
    private readonly IConfiguration                 _configuration;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole>    roleManager,
        IConfiguration               configuration)
    {
        _userManager   = userManager;
        _roleManager   = roleManager;
        _configuration = configuration;
    }

    // ─────────────────────────────────────────────────────────────────
    // ĐĂNG KÝ
    // ─────────────────────────────────────────────────────────────────

    /// <inheritdoc/>
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Kiểm tra email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            throw new InvalidOperationException($"Email '{request.Email}' đã được sử dụng.");

        // 2. Tạo entity ApplicationUser
        var user = new ApplicationUser
        {
            Id            = Guid.NewGuid().ToString(),
            TenTaiKhoan   = request.TenTaiKhoan,
            UserName      = request.Email,           // Identity dùng UserName để login
            Email         = request.Email,
            PhoneNumber   = request.PhoneNumber,
            EmailConfirmed = true                    // Bỏ qua confirm email cho môi trường dev
        };

        // 3. Tạo user với mật khẩu (Identity tự hash)
        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Tạo tài khoản thất bại: {errors}");
        }

        // 4. Gán role mặc định "User"
        await EnsureRoleExistsAsync("User");
        await _userManager.AddToRoleAsync(user, "User");

        // 5. Tạo và trả về JWT
        var roles = await _userManager.GetRolesAsync(user);
        return BuildAuthResponse(user, roles);
    }

    // ─────────────────────────────────────────────────────────────────
    // ĐĂNG NHẬP
    // ─────────────────────────────────────────────────────────────────

    /// <inheritdoc/>
    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        // 1. Tìm user theo email
        var user = await _userManager.FindByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");

        // 2. Kiểm tra mật khẩu
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không chính xác.");

        // 3. Kiểm tra tài khoản bị khóa
        if (await _userManager.IsLockedOutAsync(user))
            throw new UnauthorizedAccessException("Tài khoản đang bị khóa. Vui lòng thử lại sau.");

        // 4. Tạo và trả về JWT
        var roles = await _userManager.GetRolesAsync(user);
        return BuildAuthResponse(user, roles);
    }

    // ─────────────────────────────────────────────────────────────────
    // TẠO JWT TOKEN (private helper)
    // ─────────────────────────────────────────────────────────────────

    /// <summary>
    /// Tạo JWT Token và đóng gói vào AuthResponseDto.
    /// </summary>
    private AuthResponseDto BuildAuthResponse(ApplicationUser user, IList<string> roles)
    {
        var (token, expiresAt) = GenerateJwtToken(user, roles);

        return new AuthResponseDto
        {
            AccessToken = token,
            ExpiresAt   = expiresAt,
            User = new UserInfoDto
            {
                Id           = user.Id,
                TenTaiKhoan  = user.TenTaiKhoan ?? string.Empty,
                Email        = user.Email        ?? string.Empty,
                PhoneNumber  = user.PhoneNumber,
                Roles        = roles
            }
        };
    }

    /// <summary>
    /// Sinh JWT Token từ thông tin user và danh sách role.
    /// Đọc cấu hình từ appsettings.json section "Jwt".
    /// </summary>
    private (string token, DateTime expiresAt) GenerateJwtToken(
        ApplicationUser user, IList<string> roles)
    {
        // ── Đọc cấu hình JWT ──
        var jwtSection  = _configuration.GetSection("Jwt");
        var secretKey   = jwtSection["SecretKey"]
            ?? throw new InvalidOperationException("Jwt:SecretKey chưa được cấu hình.");
        var issuer      = jwtSection["Issuer"]   ?? "InteractHub";
        var audience    = jwtSection["Audience"] ?? "InteractHub";
        var expireHours = double.TryParse(jwtSection["ExpireHours"], out var h) ? h : 24;

        // ── Tạo signing key ──
        var keyBytes       = Encoding.UTF8.GetBytes(secretKey);
        var securityKey    = new SymmetricSecurityKey(keyBytes);
        var signingCreds   = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // ── Xây dựng Claims ──
        var claims = new List<Claim>
        {
            // Standard Claims
            new(JwtRegisteredClaimNames.Sub,   user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()), // Token ID duy nhất
            new(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),

            // Custom claims
            new("uid",           user.Id),
            new("tenTaiKhoan",   user.TenTaiKhoan ?? string.Empty),
        };

        // Thêm một Claim cho mỗi role (để [Authorize(Roles="Admin")] hoạt động)
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        // ── Tạo token ──
        var expiresAt = DateTime.UtcNow.AddHours(expireHours);

        var tokenDescriptor = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            notBefore:          DateTime.UtcNow,
            expires:            expiresAt,
            signingCredentials: signingCreds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

        return (tokenString, expiresAt);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER: Đảm bảo Role tồn tại trước khi gán
    // ─────────────────────────────────────────────────────────────────

    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
            await _roleManager.CreateAsync(new IdentityRole(roleName));
    }
}

