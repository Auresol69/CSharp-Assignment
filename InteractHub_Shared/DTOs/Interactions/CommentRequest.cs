namespace  InteractHub_Shared.DTOs.Interactions;
public class CommentRequest
    {
        public string? IdTaiKhoan { get; set; }
        public string? IdPost { get; set; }
        public string Content { get; set; } = string.Empty;
    }
