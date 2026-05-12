using InteractHub_Shared.Data.Entities;

namespace InteractHub_API.Data.Repositories;

public interface IPostRepository
{
    Task<List<Post>> GetPostsAsync(DateTime? lastTimestamp, int limit);
}

