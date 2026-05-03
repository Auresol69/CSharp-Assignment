using StackExchange.Redis;

namespace InteractHub_API.Services;

/// <summary>
/// Triển khai IPresenceService dùng StackExchange.Redis trực tiếp.
/// Lưu trạng thái online của user dưới dạng key-value với TTL 30 phút.
/// </summary>
public class PresenceService : IPresenceService
{
    private readonly IDatabase _redis;
    // Tôi tin rằng hệ thống sẽ xóa Key này một cách thủ công ngay khi user tắt web.
    // Nhưng NẾU trong 30 phút qua mà tôi không có bất kỳ tương tác nào để 'làm mới' nó, 
    // chứng tỏ hệ thống của tôi đã gặp lỗi và quên xóa nó rồi. Hãy tự động xóa nó giúp tôi.
    private static readonly TimeSpan SetTtl = TimeSpan.FromMinutes(30);
    private const string UserPresenceKeyPrefix = "user:presence:";

    public PresenceService(IConnectionMultiplexer connectionMultiplexer)
    {
        _redis = connectionMultiplexer.GetDatabase();
    }



    /// <summary>
    /// Kiểm tra user có online không (key tồn tại trong Redis).
    /// </summary>
    public async Task<bool> IsUserOnlineAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return false;

        var key = $"{UserPresenceKeyPrefix}{userId}";

        return await _redis.KeyExistsAsync(key);
    }

    public async Task AddConnectionAsync(string userId, string connectionId)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(connectionId))
            throw new ArgumentException("User ID hoặc Connection ID không thể trống.");

        var key = $"{UserPresenceKeyPrefix}{userId}";

        await _redis.SetAddAsync(key, connectionId);

        await _redis.KeyExpireAsync(key, SetTtl);
    }

    public async Task RemoveConnectionAsync(string userId, string connectionId)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(connectionId))
            return;

        var key = $"{UserPresenceKeyPrefix}{userId}";

        await _redis.SetRemoveAsync(key, connectionId);

        var count = await _redis.SetLengthAsync(key);

        if (count == 0)
            await _redis.KeyDeleteAsync(key);
    }

    public async Task<string[]> GetConnectionsAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Array.Empty<string>();

        var key = $"{UserPresenceKeyPrefix}{userId}";

        // SMEMBERS: Lấy toàn bộ các phần tử trong Set
        var connections = await _redis.SetMembersAsync(key);

        // Select tương tự Map
        return connections.Select(c => c.ToString()).ToArray();
    }
}
