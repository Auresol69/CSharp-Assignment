namespace InteractHub_API.Data.Entities;

/// <summary>
/// Bảng trung gian cho mối quan hệ nhiều-nhiều giữa Post và Hashtag.
/// Khóa chính là khóa composite (IdPost + IdHashtag).
/// Maps to table: PostHashtag
/// </summary>
public class PostHashtag
{
    /// <summary>Khóa ngoại trỏ đến Post (phần 1 composite PK)</summary>
    public string IdPost { get; set; } = string.Empty;

    /// <summary>Khóa ngoại trỏ đến Hashtag (phần 2 composite PK)</summary>
    public string IdHashtag { get; set; } = string.Empty;

    // ──────────────── Navigation Properties ────────────────

    /// <summary>Bài viết tham chiếu</summary>
    public Post? Post { get; set; }

    /// <summary>Hashtag tham chiếu</summary>
    public Hashtag? Hashtag { get; set; }
}
