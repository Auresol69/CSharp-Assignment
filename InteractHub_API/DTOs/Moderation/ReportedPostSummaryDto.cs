namespace InteractHub_API.DTOs.Moderation;

public sealed class ReportedPostSummaryDto
{
    public string PostId { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? AuthorId { get; set; }
    public string? AuthorName { get; set; }
    public string? AuthorAvatarUrl { get; set; }
    public int ReportCount { get; set; }
    public bool IsBlacklisted { get; set; }
}