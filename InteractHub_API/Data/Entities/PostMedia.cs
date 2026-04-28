namespace InteractHub_API.Data.Entities;

/// <summary>
/// Đại diện cho một tệp đa phương tiện (ảnh hoặc video) đính kèm trong bài viết.
/// Maps to table: PostMedia
/// </summary>
public class PostMedia
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Khóa ngoại trỏ đến Post</summary>
    public string PostId { get; set; } = string.Empty;

    /// <summary>URL lưu trữ tệp (Azure Blob Storage hoặc CDN)</summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>Loại tệp: Image hoặc Video</summary>
    public MediaType MediaType { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Bài viết chứa tệp đa phương tiện này</summary>
    public Post? Post { get; set; }
}
