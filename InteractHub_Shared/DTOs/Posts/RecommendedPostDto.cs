namespace InteractHub_Shared.DTOs.Posts;

/// <summary>
/// DTO chứa thông tin bài viết được gợi ý bởi thuật toán đồ thị Neo4j.
/// Bao gồm số hashtag chung và điểm gợi ý (RecommendationScore).
/// </summary>
/// <param name="PostId">ID bài viết được gợi ý</param>
/// <param name="SharedTagsCount">Số hashtag trùng với bài đã like</param>
/// <param name="SharedTags">Danh sách tên hashtag chung</param>
/// <param name="RecommendationScore">Điểm ưu tiên (commonTagsCount × 1.5)</param>
public record RecommendedPostDto(
    string PostId,
    int SharedTagsCount,
    List<string> SharedTags,
    double RecommendationScore
);
