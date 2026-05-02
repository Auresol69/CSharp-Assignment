namespace InteractHub_API.DTOs.Posts;

public class PostMediaDto
{
    public string Id { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty; // "Image" hoặc "Video"
}
