using InteractHub_Shared.DTOs.Auth;
using InteractHub_API.Services;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub_API.Controllers;

/// <summary>
/// Controller xử lý các endpoint xác thực: đăng ký và đăng nhập.
/// Route: /api/auth
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger      = logger;
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/auth/register
    // ─────────────────────────────────────────────────────────────────

    /// <summary>Đăng ký tài khoản mới</summary>
    /// <response code="201">Đăng ký thành công, trả về JWT token</response>
    /// <response code="400">Dữ liệu không hợp lệ hoặc email đã tồn tại</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails),  StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            _logger.LogInformation("Tài khoản mới đã đăng ký: {Email}", request.Email);
            return CreatedAtAction(nameof(Register), response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Đăng ký thất bại cho {Email}: {Message}", request.Email, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────────────────────

    /// <summary>Đăng nhập và nhận JWT token</summary>
    /// <response code="200">Đăng nhập thành công</response>
    /// <response code="401">Sai email/mật khẩu hoặc tài khoản bị khóa</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails),  StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            _logger.LogInformation("Đăng nhập thành công: {Email}", request.Email);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Đăng nhập thất bại cho {Email}: {Message}", request.Email, ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
    }
}
