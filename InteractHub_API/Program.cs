using System.Text;
using InteractHub_API.Data;
using InteractHub_API.Data.Entities;
using InteractHub_API.Services;
using InteractHub_API.Services.Friends;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

LoadDotEnv();

var builder = WebApplication.CreateBuilder(args);

// ═══════════════════════════════════════════════════════════════════
// 1. DATABASE – Entity Framework Core + SQL Server
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null)));

// ═══════════════════════════════════════════════════════════════════
// 2. IDENTITY – ASP.NET Core Identity (khóa string/GUID)
// ═══════════════════════════════════════════════════════════════════
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // Chính sách mật khẩu
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;

        // Khóa tài khoản sau 5 lần sai
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
        options.Lockout.AllowedForNewUsers = true;

        // Yêu cầu email duy nhất
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ═══════════════════════════════════════════════════════════════════
// 3. AUTHENTICATION – JWT Bearer
// ═══════════════════════════════════════════════════════════════════
var jwtSection = builder.Configuration.GetSection("Jwt");
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? Environment.GetEnvironmentVariable("Jwt__SecretKey")
    ?? jwtSection["SecretKey"]
    ?? throw new InvalidOperationException(
        "Thiếu JWT secret key. Hãy cấu hình JWT_SECRET_KEY (hoặc Jwt__SecretKey / Jwt:SecretKey)."
    );
var issuer = jwtSection["Issuer"] ?? "InteractHub";
var audience = jwtSection["Audience"] ?? "InteractHub";

var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services
    .AddAuthentication(options =>
    {
        // Đặt scheme mặc định là JWT cho cả Authentication lẫn Challenge
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,   // Tự động từ chối token hết hạn
            ValidateIssuerSigningKey = true,

            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),

            // Không cho phép lệch đồng hồ (tốt nhất cho môi trường server)
            ClockSkew = TimeSpan.Zero
        };

        // Xử lý lỗi 401/403 trả về JSON thay vì trang HTML
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync(
                    "{\"message\":\"Bạn chưa đăng nhập hoặc token không hợp lệ.\"}");
            },
            OnForbidden = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync(
                    "{\"message\":\"Bạn không có quyền truy cập tài nguyên này.\"}");
            }
        };
    });

builder.Services.AddAuthorization();

// ═══════════════════════════════════════════════════════════════════
// 4. APPLICATION SERVICES (Dependency Injection)
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMediaService, CloudinaryService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<ICommentService, CommentService>();

//Thêm để FriendService có thể inject
builder.Services.AddScoped<FriendService>();
// Background Service: tự động xóa Story hết hạn mỗi 1 giờ
// AddHostedService đăng ký dưới dạng Singleton IHostedService — đúng yêu cầu BackgroundService
builder.Services.AddHostedService<StoryCleanupService>();

// ═══════════════════════════════════════════════════════════════════
// 5. CONTROLLERS + SWAGGER / OPENAPI
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "InteractHub API",
        Version = "v1",
        Description = "Social Media Web Application - ASP.NET Core 10"
    });

    // Them nut Authorize trong Swagger UI de test JWT
    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhap JWT token. Vi du: Bearer eyJhbGci...",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    options.AddSecurityDefinition(jwtScheme.Reference.Id, jwtScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });
});

// ═══════════════════════════════════════════════════════════════════
// 6. CORS (cho phép React frontend kết nối)
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000")  // CRA dev server
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ═══════════════════════════════════════════════════════════════════
// BUILD APP
// ═══════════════════════════════════════════════════════════════════
var app = builder.Build();

await IdentitySeeder.SeedAsync(app.Services, app.Logger);

// ─── Middleware Pipeline ───────────────────────────────────────────

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(ui =>
    {
        ui.SwaggerEndpoint("/swagger/v1/swagger.json", "InteractHub API v1");
        ui.RoutePrefix = string.Empty; // Swagger làm trang chủ ở /
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static void LoadDotEnv()
{
    var dotEnvPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (!File.Exists(dotEnvPath))
    {
        return;
    }

    foreach (var line in File.ReadAllLines(dotEnvPath))
    {
        var trimmedLine = line.Trim();
        if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = trimmedLine.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = trimmedLine[..separatorIndex].Trim();
        var value = trimmedLine[(separatorIndex + 1)..].Trim().Trim('"');
        Environment.SetEnvironmentVariable(key, value);
    }
}
