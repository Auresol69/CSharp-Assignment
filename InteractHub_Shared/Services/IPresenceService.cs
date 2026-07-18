namespace InteractHub_Shared.Services;

/// <summary>
/// Service quản lý tình trạng online của người dùng.
/// Dùng Redis để lưu trạng thái với TTL (Time To Live) tự động hết hạn.
/// </summary>
public interface IPresenceService
{
    /// <summary>
    /// Thêm một Connection ID vào danh sách kết nối của user.
    /// Thiết lập TTL (ví dụ 30 phút) để dọn dẹp nếu server sập đột ngột.
    /// </summary>
    Task AddConnectionAsync(string userId, string connectionId);

    /// <summary>
    /// Xóa một Connection ID khỏi danh sách kết nối của user.
    /// Nếu danh sách kết nối trống, xóa luôn key của user đó.
    /// </summary>
    Task RemoveConnectionAsync(string userId, string connectionId);

    /// <summary>
    /// Lấy danh sách tất cả các Connection ID hiện tại của user.
    /// Hữu ích khi muốn gửi thông báo đến tất cả các tab mà user đang mở.
    /// </summary>
    Task<string[]> GetConnectionsAsync(string userId);

    /// <summary>
    /// Kiểm tra xem người dùng có đang online không.
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <returns>true nếu key tồn tại trong Redis (TTL chưa hết), false nếu offline</returns>
    Task<bool> IsUserOnlineAsync(string userId);

    /// <summary>
    /// Lấy danh sách tất cả userId đang online (dựa trên các key Redis còn tồn tại).
    /// </summary>
    Task<IReadOnlyList<string>> GetAllOnlineUserIdsAsync();
}
