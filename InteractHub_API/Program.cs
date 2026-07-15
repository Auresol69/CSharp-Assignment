using System.Text;
using InteractHub_Shared.Data;
using InteractHub_Shared.Data.Entities;
using InteractHub_API.Services;
using InteractHub_Shared.Hubs;
using InteractHub_Shared.Services;
using InteractHub_API.Services.Friends;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;
using Microsoft.Identity.Client.AppConfig;

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
            // Chấp nhận token từ Query String cho SignalR
            OnMessageReceived = context =>
            {
                // 1. Lấy token từ query string
                var accessToken = context.Request.Query["access_token"];

                // 2. Nếu là request đến SignalR Hub
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    // Gán vào context để hệ thống dùng token này xác thực
                    context.Token = accessToken;
                }

                // Nếu không có access_token trong query, middleware sẽ tự động 
                // tìm trong Header "Authorization: Bearer ..." như mặc định.
                return Task.CompletedTask;
            },

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
// 3.5 CACHING – Redis Distributed Cache
// ═══════════════════════════════════════════════════════════════════
var redisConnection = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("Redis")
    ?? "localhost:6379";

// Đăng ký kết nối gốc trước (IConnectionMultiplexer)

// app có thể sẽ mở 3 connection riêng biệt tới Redis. 
// Để tối ưu, có thể bắt chúng "dùng chung" một kết nối duy nhất
var connection = ConnectionMultiplexer.Connect(redisConnection);

// 1. Đăng ký ConnectionMultiplexer (Cái mà PresenceService đang cần)
// Quản lý kết nối Redis: Nó chịu trách nhiệm thiết lập, duy trì và quản lý kết nối giữa ứng dụng .NET và máy chủ Redis.
// Chia sẻ kết nối (Multiplexing): Nó cho phép nhiều phần của ứng dụng (nhiều luồng - threads) chia sẻ chung một kết nối vật lý duy nhất tới Redis.
// Điều này giúp tối ưu hóa hiệu suất và giảm bớt gánh nặng tạo/đóng kết nối liên tục

// Kết nối gốc, dùng để thao tác trực tiếp với Redis (như xử lý Redis Streams bằng lệnh XADD, XREAD).
builder.Services.AddSingleton<IConnectionMultiplexer>(connection);

// 2. Vẫn giữ cái này nếu có dùng IDistributedCache ở ngay tác vụ cache trong extensions

// Cung cấp dịch vụ IDistributedCache. Dùng để lưu các cặp Key-Value có thời hạn 
// (như lưu Session, lưu Cache dữ liệu bài viết để giảm tải cho MySQL).
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.ConnectionMultiplexerFactory = () => Task.FromResult<IConnectionMultiplexer>(connection);
});

// ═══════════════════════════════════════════════════════════════════
// 4. APPLICATION SERVICES (Dependency Injection)
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMediaService, CloudinaryService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IPresenceService, PresenceService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IFriendshipService, FriendshipService>();
builder.Services.AddScoped<InteractHub_API.Data.Repositories.IPostRepository, InteractHub_API.Data.Repositories.PostRepository>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IInteractionService, InteractionService>();
builder.Services.AddScoped<IHashtagService, HashtagService>();

// Neo4j Graph Service: Singleton vì IDriver là thread-safe và được tái dùng toàn bộ app lifetime
// (tương tự IConnectionMultiplexer của Redis)
builder.Services.AddSingleton<IAdvancedGraphService, AdvancedGraphService>();

//Thêm để FriendService có thể inject
builder.Services.AddScoped<FriendService>();
// Background Service: tự động xóa Story hết hạn mỗi 1 giờ
// AddHostedService đăng ký dưới dạng Singleton IHostedService — đúng yêu cầu BackgroundService
builder.Services.AddHostedService<StoryCleanupService>();

// ═══════════════════════════════════════════════════════════════════
// 5. CONTROLLERS + SWAGGER / OPENAPI + SIGNALR
// ═══════════════════════════════════════════════════════════════════
builder.Services.AddControllers();

// Sử dụng tính năng Pub/Sub của Redis để làm "cầu nối" cho SignalR.
builder.Services.AddSignalR()
    .AddStackExchangeRedis(options =>
    {
        options.ConnectionFactory = _ => Task.FromResult<IConnectionMultiplexer>(connection);
    });

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
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ═══════════════════════════════════════════════════════════════════
// BUILD APP
// ═══════════════════════════════════════════════════════════════════
var app = builder.Build();

app.UseCors("AllowReactApp");

// Tự động tạo DB và chạy Migration khi khởi động
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        // Lệnh này sẽ kiểm tra: nếu chưa có DB thì tạo DB, nếu chưa chạy migration nào thì chạy hết
        await dbContext.Database.MigrateAsync();
        app.Logger.LogInformation("Đã chạy Migration và cập nhật Database thành công.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Có lỗi xảy ra khi tự động chạy Migration.");
    }
}

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

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// Rate Limit
app.UseMiddleware<RateLimitingMiddleware>();

app.MapControllers();

// Mở cổng WebSocket
app.MapHub<NotificationHub>("/hubs/notification");

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
