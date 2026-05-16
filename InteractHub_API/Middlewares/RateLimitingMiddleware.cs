using System.Security.Claims;
using StackExchange.Redis;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConnectionMultiplexer _redis;

    public RateLimitingMiddleware(RequestDelegate next, IConnectionMultiplexer redis)
    {
        _next = next;
        _redis = redis;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var db = _redis.GetDatabase();
        var userId = context.User.FindFirst("uid")?.Value
                     ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? context.Connection.RemoteIpAddress?.ToString()
                     ?? "anonymous";

        // ratelimit:bao_123:202605022245
        var key = $"ratelimit:{userId}:{DateTime.UtcNow:yyyyMMddHHmm}";

        // Tăng giá trị key lên 1
        var currentRequest = await db.StringIncrementAsync(key);

        // Set TTL only when key is created first time
        if (currentRequest == 1)
        {
            await db.KeyExpireAsync(key, TimeSpan.FromSeconds(5));
        }

        // Check threshold every request
        if (currentRequest > 20)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.Response.WriteAsync("Rap chậm thôi. Vui lòng thử lại sau 60s.");
            return;
        }

        await _next(context);
    }
}