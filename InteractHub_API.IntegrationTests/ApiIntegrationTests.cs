using System.Net;
using System.Net.Http.Json;

namespace InteractHub_API.IntegrationTests;

public class ApiIntegrationTests
{
    // Override via env var INTERACTHUB_API_BASEURL in local or staging environments.
    // In CI (GitHub Actions), this defaults to localhost and will be skipped gracefully
    // because no live server is available without a full docker-compose stack.
    private static readonly string BaseUrl =
        Environment.GetEnvironmentVariable("INTERACTHUB_API_BASEURL") ?? "http://127.0.0.1:5153";

    private static async Task<bool> IsApiAvailableAsync(HttpClient client)
    {
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
            var response = await client.GetAsync("/", cts.Token);
            return response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.Unauthorized;
        }
        catch
        {
            return false;
        }
    }

    // Skips the test instead of failing when the API server is not reachable.
    // Use this for all integration tests that require a live running backend.
    private static async Task SkipIfApiUnavailableAsync(HttpClient client)
    {
        if (!await IsApiAvailableAsync(client))
        {
            Skip.If(true, $"[SKIPPED] API at {BaseUrl} is not reachable. " +
                         "Run the full stack (docker-compose up) to execute integration tests locally.");
        }
    }

    [SkippableFact]
    [Trait("Category", "Integration")]
    public async Task ProtectedEndpoints_WithoutToken_ShouldReturn401Or403()
    {
        using var client = new HttpClient { BaseAddress = new Uri(BaseUrl) };
        await SkipIfApiUnavailableAsync(client);

        var paths = new[]
        {
            "/api/Profile/me",
            "/api/Post/feed",
            "/api/Comments/post/nonexistent",
            "/api/Notification",
            "/api/Hashtag/trending",
            "/api/admin/moderation/reported-posts"
        };

        foreach (var path in paths)
        {
            var res = await client.GetAsync(path);
            Assert.True(res.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden,
                $"Expected 401/403 for {path}, got {(int)res.StatusCode}");
        }
    }

    [SkippableFact]
    [Trait("Category", "Integration")]
    public async Task Auth_Register_Then_Login_ShouldSucceed()
    {
        using var client = new HttpClient { BaseAddress = new Uri(BaseUrl) };
        await SkipIfApiUnavailableAsync(client);

        var email = $"it_{Guid.NewGuid():N}@interacthub.local";
        var password = "TestUser@12345";

        var registerPayload = new
        {
            email,
            password,
            confirmPassword = password,
            tenTaiKhoan = $"it_{Guid.NewGuid():N}"[..10]
        };

        var reg = await client.PostAsJsonAsync("/api/Auth/register", registerPayload);
        Assert.True(reg.StatusCode is HttpStatusCode.Created or HttpStatusCode.BadRequest);

        var login = await client.PostAsJsonAsync("/api/Auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        var body = await login.Content.ReadAsStringAsync();
        Assert.Contains("accessToken", body, StringComparison.OrdinalIgnoreCase);
    }
}
