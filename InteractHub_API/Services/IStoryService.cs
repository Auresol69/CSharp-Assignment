using InteractHub_Shared.Data.Entities;
using InteractHub_Shared.DTOs.Stories;

namespace InteractHub_API.Services;

public interface IStoryService
{
    Task<Story> CreateStoryAsync(string userId, CreateStoryRequestDto request);

    Task DeleteStoryAsync(string storyId);

    Task<IReadOnlyList<Story>> GetGlobalStoriesAsync(int take = 20);

    Task<IReadOnlyList<Story>> GetLocalStoriesAsync(string userId, int take = 20);
}

