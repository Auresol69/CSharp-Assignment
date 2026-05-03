using InteractHub_API.Data.Entities;
using InteractHub_API.DTOs.Stories;

namespace InteractHub_API.Services;

public interface IStoryService
{
    Task<Story> CreateStoryAsync(string userId, CreateStoryRequestDto request);

    Task DeleteStoryAsync(string storyId);

    Task<IReadOnlyList<Story>> GetGlobalStoriesAsync(int take = 20);

    Task<IReadOnlyList<Story>> GetLocalStoriesAsync(string userId, int take = 20);
}
