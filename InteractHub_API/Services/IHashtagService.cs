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
}