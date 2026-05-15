namespace InteractHub_Shared.Data.Entities;

/// <summary>
/// Loại tệp đính kèm trong một bài viết.
/// Được lưu dưới dạng string trong DB (HasConversion) để dễ đọc.
/// </summary>
public enum MediaType
{
    Image,
    Video
}