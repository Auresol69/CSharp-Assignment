namespace InteractHub_API.Services;

public interface IReportService
{
    Task ReportPostAsync(string postId, string reason, string reporterId);

    Task<IReadOnlyList<InteractHub_API.DTOs.Moderation.ReportedPostSummaryDto>> GetReportedPostsAsync();

    Task<IReadOnlyList<InteractHub_API.DTOs.Moderation.PostReportDetailDto>> GetReportsByPostAsync(string postId);

    Task<bool> RemoveFromBlacklistAsync(string postId);

    Task<bool> ApproveAndDeletePostAsync(string postId);

    Task<bool> ClearReportsAsync(string postId);
}