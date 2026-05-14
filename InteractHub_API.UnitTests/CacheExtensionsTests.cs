using InteractHub_API.Extensions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace InteractHub_API.UnitTests.Extensions;

public class CacheExtensionsTests
{
    private static IDistributedCache CreateCache()
    {
        return new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
    }

    [Fact]
    public async Task GetOrSetAsync_WhenCacheMiss_CallsFactoryAndCaches()
    {
        var cache = CreateCache();
        var key = "cache:getorset:1";
        var calls = 0;

        var first = await cache.GetOrSetAsync(key, () =>
        {
            calls++;
            return Task.FromResult("value-1");
        });

        var second = await cache.GetOrSetAsync(key, () =>
        {
            calls++;
            return Task.FromResult("value-2");
        });

        Assert.Equal("value-1", first);
        Assert.Equal("value-1", second);
        Assert.Equal(1, calls);
    }

    [Fact]
    public async Task GetOrSetAsync_WhenFactoryReturnsDefault_DoesNotCache()
    {
        var cache = CreateCache();
        var key = "cache:getorset:default";
        var calls = 0;

        _ = await cache.GetOrSetAsync<string?>(key, () =>
        {
            calls++;
            return Task.FromResult<string?>(null);
        });

        _ = await cache.GetOrSetAsync<string?>(key, () =>
        {
            calls++;
            return Task.FromResult<string?>(null);
        });

        Assert.Equal(2, calls);
    }

    [Fact]
    public async Task GetAsync_WhenCachedJsonInvalid_ReturnsDefault()
    {
        var cache = CreateCache();
        var key = "cache:get:invalid";
        await cache.SetStringAsync(key, "{ invalid-json }");

        var value = await cache.GetAsync<Dictionary<string, string>>(key);

        Assert.Null(value);
    }

    [Fact]
    public async Task SetAsync_ThenGetAsync_ReturnsRoundTripValue()
    {
        var cache = CreateCache();
        var key = "cache:setget:1";
        var payload = new Dictionary<string, string> { ["k"] = "v" };

        await cache.SetAsync(key, payload, TimeSpan.FromMinutes(1));
        var value = await cache.GetAsync<Dictionary<string, string>>(key);

        Assert.NotNull(value);
        Assert.Equal("v", value!["k"]);
    }

    [Fact]
    public async Task GetOrSetAsync_WithBlankKey_ThrowsArgumentException()
    {
        var cache = CreateCache();

        await Assert.ThrowsAsync<ArgumentException>(() =>
            cache.GetOrSetAsync("", () => Task.FromResult("x")));
    }
}
