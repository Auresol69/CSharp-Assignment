using InteractHub_API.Helpers;

namespace InteractHub_API.UnitTests.Helpers;

public class CloudinaryUrlHelperTests
{
    [Theory]
    [InlineData("https://res.cloudinary.com/demo/image/upload/v1715000000/posts/abc.png", "posts/abc")]
    [InlineData("https://res.cloudinary.com/demo/image/upload/posts/nested/item.jpg", "posts/nested/item")]
    [InlineData("https://res.cloudinary.com/demo/video/upload/v1715000000/stories/clip.mp4", "stories/clip")]
    public void TryGetPublicIdFromUrl_WithValidUrl_ReturnsExpectedPublicId(string url, string expected)
    {
        var ok = CloudinaryUrlHelper.TryGetPublicIdFromUrl(url, out var publicId);

        Assert.True(ok);
        Assert.Equal(expected, publicId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-url")]
    [InlineData("https://res.cloudinary.com/demo/image/private/v1/file.png")]
    [InlineData("https://res.cloudinary.com/demo/image/upload/")]
    public void TryGetPublicIdFromUrl_WithInvalidUrl_ReturnsFalse(string url)
    {
        var ok = CloudinaryUrlHelper.TryGetPublicIdFromUrl(url, out var publicId);

        Assert.False(ok);
        Assert.Equal(string.Empty, publicId);
    }
}
