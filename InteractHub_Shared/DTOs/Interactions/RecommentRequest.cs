namespace InteractHub_Shared.DTOs.Interactions;

public class RecommentRequest
{
    public string? IdPost { get; set; }
    public string Content { get; set; } = string.Empty;
}

