namespace InteractHub_Shared.DTOs.Moderation;

public sealed class PostReportDetailDto
{
    public string ReportId { get; set; } = string.Empty;
    public string? PostId { get; set; }
    public string? ReporterId { get; set; }
    public string? ReporterName { get; set; }
    public string? ReporterAvatarUrl { get; set; }
    public string? Reason { get; set; }
}
