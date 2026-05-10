public interface IHashtagService
{
    /// <summary>
    /// Tăng score của hashtag lên
    /// </summary>
    Task IncrementHashtagAsync(string hashtag);

    /// <summary>
    /// lấy 10 (default) hashtag cao nhất
    /// </summary>
    Task<List<string>> GetTrendingHashtagsAsync(int take = 10);

    /// <summary>
    /// Lấy top hashtag theo bộ lọc thời gian: daily, weekly, monthly.
    /// </summary>
    Task<List<string>> GetTopHashtagsAsync(string filterType, int take = 10);

    /// <summary>
    /// Lấy hoặc tạo hashtag, trả về ID.
    /// </summary>
    Task<string> GetOrCreateHashtagAsync(string hashtagContent);

    /// <summary>
    /// Lấy các bài viết theo hashtag.
    /// </summary>
    Task<IReadOnlyList<InteractHub_API.Data.Entities.Post>> GetPostsByHashtagAsync(string hashtagContent, DateTime? lastTimestamp = null, int take = 10);
}