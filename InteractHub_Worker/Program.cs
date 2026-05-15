using InteractHub_Shared.Data;
using InteractHub_Worker;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using InteractHub_Shared.Services;

var builder = Host.CreateApplicationBuilder(args);

var redisConnection = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("Redis")
    ?? "localhost:6379";

var sqlConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured for InteractHub_Worker.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(sqlConnection));

builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
    ConnectionMultiplexer.Connect(redisConnection));

builder.Services.AddHostedService<RedisStreamWorker>();

builder.Services.AddScoped<INotificationService, NotificationService>();

var host = builder.Build();
host.Run();
