namespace InteractHub_API.Helpers;

public static class CloudinaryUrlHelper
{
    public static bool TryGetPublicIdFromUrl(string mediaUrl, out string publicId)
    {
        publicId = string.Empty;

        if (!Uri.TryCreate(mediaUrl, UriKind.Absolute, out var uri))
        {
            return false;
        }

        var uploadIndex = uri.AbsolutePath.IndexOf("/upload/", StringComparison.OrdinalIgnoreCase);
        if (uploadIndex < 0)
        {
            return false;
        }

        var remainder = uri.AbsolutePath[(uploadIndex + "/upload/".Length)..].Trim('/');
        if (string.IsNullOrWhiteSpace(remainder))
        {
            return false;
        }

        var parts = remainder.Split('/', StringSplitOptions.RemoveEmptyEntries).ToList();
        if (parts.Count == 0)
        {
            return false;
        }

        if (parts[0].Length > 1 && parts[0][0] == 'v' && long.TryParse(parts[0][1..], out _))
        {
            parts.RemoveAt(0);
        }

        if (parts.Count == 0)
        {
            return false;
        }

        var lastIndex = parts.Count - 1;
        parts[lastIndex] = Path.GetFileNameWithoutExtension(parts[lastIndex]);

        publicId = string.Join('/', parts);
        return !string.IsNullOrWhiteSpace(publicId);
    }
}
