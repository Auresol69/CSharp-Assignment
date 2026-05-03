using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace InteractHub_API.Extensions;

/// <summary>
/// Extension methods cho IDistributedCache (Redis).
/// Cung cấp Generic GetOrSetAsync để cache dữ liệu dưới dạng JSON.
/// </summary>
public static class CacheExtensions
{
    /// <summary>
    /// Lấy giá trị từ cache dưới dạng Generic type T (JSON deserialization).
    /// Nếu key không tồn tại, gọi factory function để lấy giá trị mới,
    /// rồi cache với TTL được chỉ định.
    /// </summary>
    /// <typeparam name="T">Kiểu dữ liệu cần cache</typeparam>
    /// <param name="cache">IDistributedCache instance (Redis)</param>
    /// <param name="key">Cache key</param>
    /// <param name="factory">Async function để lấy dữ liệu nếu cache miss</param>
    /// <param name="ttl">Thời gian sống của cache item (mặc định 5 phút)</param>
    /// <returns>Dữ liệu đã cache hoặc mới lấy từ factory</returns>
    public static async Task<T?> GetOrSetAsync<T>(
        this IDistributedCache cache,
        string key,
        Func<Task<T>> factory,
        TimeSpan? ttl = null)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Cache key không thể trống.", nameof(key));

        // Thử lấy từ cache
        var cachedValue = await cache.GetStringAsync(key);
        if (!string.IsNullOrEmpty(cachedValue))
        {
            try
            {
                return JsonSerializer.Deserialize<T>(cachedValue);
            }
            catch (JsonException)
            {
                // Nếu deserialize fail, xóa cache rồi lấy mới
                await cache.RemoveAsync(key);
            }
        }

        // Cache miss: gọi factory
        var value = await factory();

        // Nếu factory trả về null, không cache
        if (EqualityComparer<T>.Default.Equals(value, default(T)))
            return default;

        // Serialize và lưu vào cache
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl ?? TimeSpan.FromMinutes(5)
        };

        var json = JsonSerializer.Serialize(value);
        await cache.SetStringAsync(key, json, options);

        return value;
    }

    /// <summary>
    /// Đặt giá trị vào cache dưới dạng JSON.
    /// </summary>
    /// <typeparam name="T">Kiểu dữ liệu</typeparam>
    /// <param name="cache">IDistributedCache instance</param>
    /// <param name="key">Cache key</param>
    /// <param name="value">Dữ liệu cần cache</param>
    /// <param name="ttl">Thời gian sống (mặc định 5 phút)</param>
    public static async Task SetAsync<T>(
        this IDistributedCache cache,
        string key,
        T value,
        TimeSpan? ttl = null)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Cache key không thể trống.", nameof(key));

        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl ?? TimeSpan.FromMinutes(5)
        };

        var json = JsonSerializer.Serialize(value);
        await cache.SetStringAsync(key, json, options);
    }

    /// <summary>
    /// Lấy giá trị từ cache dưới dạng Generic type T.
    /// Trả về null nếu key không tồn tại hoặc deserialize fail.
    /// </summary>
    /// <typeparam name="T">Kiểu dữ liệu</typeparam>
    /// <param name="cache">IDistributedCache instance</param>
    /// <param name="key">Cache key</param>
    /// <returns>Đã deserialize data hoặc null</returns>
    public static async Task<T?> GetAsync<T>(
        this IDistributedCache cache,
        string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Cache key không thể trống.", nameof(key));

        var cachedValue = await cache.GetStringAsync(key);
        if (string.IsNullOrEmpty(cachedValue))
            return default;

        try
        {
            return JsonSerializer.Deserialize<T>(cachedValue);
        }
        catch (JsonException)
        {
            return default;
        }
    }
}
