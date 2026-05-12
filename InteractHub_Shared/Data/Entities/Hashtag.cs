namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Đại diện cho một hashtag trong hệ thống.
/// Maps to table: Hashtag
/// </summary>
public class Hashtag
{
    /// <summary>Khóa chính (GUID dạng string)</summary>
    public string IdHashtag { get; set; } = Guid.NewGuid().ToString();

    /// <summary>Nội dung hashtag đã normalize (chữ thường, không dấu #, ví dụ: "dotnet", "csharp")</summary>
    public required string NoiDung { get; set; }

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Danh sách liên kết Post-Hashtag (quan hệ n-n)</summary>
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
}