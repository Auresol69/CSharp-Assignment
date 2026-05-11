# React + TypeScript + Vite

## Danh sach API moi them ngay 2026-05-02

Tat ca endpoint ben duoi yeu cau JWT Bearer token, tru khi co cau hinh khac trong controller.

### Profile

| Method | Endpoint | Mo ta |
| :--- | :--- | :--- |
| `GET` | `/api/Profile/me` | Lay profile cua nguoi dung hien tai. |
| `GET` | `/api/Profile/{userId}` | Lay profile cua nguoi dung khac. |
| `PUT` | `/api/Profile/me` | Cap nhat profile cua nguoi dung hien tai. |
| `POST` | `/api/Profile/change-password` | Doi mat khau. |
| `POST` | `/api/Profile/upload-avatar` | Upload avatar bang `multipart/form-data`. |
| `POST` | `/api/Profile/{userId}/follow` | Follow hoac unfollow mot nguoi dung. |
| `GET` | `/api/Profile/{userId}/followers?page=1&size=20` | Lay danh sach followers. |
| `GET` | `/api/Profile/{userId}/following?page=1&size=20` | Lay danh sach following. |

### Friendship

| Method | Endpoint | Mo ta |
| :--- | :--- | :--- |
| `POST` | `/api/Friendship/{recipientId}/request` | Gui yeu cau ket ban. |
| `POST` | `/api/Friendship/{senderId}/accept` | Chap nhan yeu cau ket ban. |

### Posts

| Method | Endpoint | Mo ta |
| :--- | :--- | :--- |
| `GET` | `/api/Post/feed?lastTimestamp={isoDateTime}&limit=10` | Lay feed bai viet dang phan trang theo thoi gian. |

### Realtime

| Type | Endpoint | Mo ta |
| :--- | :--- | :--- |
| `SignalR Hub` | `/hubs/notification` | Ket noi realtime notification/presence; client nhan cac event `ReceiveMessage`, `ReceiveNotification`, `UserConnected`, `UserDisconnected`, `ReceiveFriendRequest`, `FriendRequestAccepted`. |


| 🎯 Tính năng | 📋 Mô tả chi tiết |
| :--- | :--- |
| **🔐 Authentication** | Tạo tài khoản, đăng nhập an toàn và bảo mật sử dụng JWT. |
| **📰 Posts** | Đăng các cập nhật trạng thái đa phương tiện (văn bản, hình ảnh). |
| **💬 Interactions** | Cho phép người dùng thích, bình luận và chia sẻ bài viết. |
| **📸 Stories** | Chia sẻ các nội dung mang tính chất tạm thời (biến mất sau 24h). |
| **👥 Friends** | Gửi, nhận, hủy và quản lý danh sách/yêu cầu kết bạn. |
| **⚡ Real-time Notifs**| Nhận thông báo hệ thống theo thời gian thực thông qua SignalR. |
| **⚙️ Profile Mgt.** | Cập nhật hồ sơ cá nhân và tinh chỉnh các cài đặt người dùng. |
| **🛡️ Moderation** | Theo dõi hashtag thịnh hành và báo cáo/kiểm duyệt nội dung xấu. |

---

## Directory structure
```js
InteractHub_API/
├── Controllers/         # Có sẵn, chứa các API Endpoints
├── Data/                # Thư mục mới
│   ├── Entities/        # Chứa các class Database (User, Post...)
│   ├── Repositories/    # Chứa các lớp truy vấn DB (IPostRepository...)
│   └── AppDbContext.cs  # File cấu hình kết nối DB
├── Services/            # Thư mục mới - Chứa Logic nghiệp vụ (AuthService, PostService...)
├── DTOs/                # Thư mục mới - Chứa Data Transfer Objects
├── Helpers/             # Thư mục mới - Chứa các tiện ích (JWT, AutoMapper...)
├── Properties/          # <--- CHỈ ĐỂ CẤU HÌNH RUN
├── appsettings.json     # Nơi để Connection String
├── Program.cs           # File cấu hình chính của toàn bộ App
└── InteractHub_API.csproj
```

---

## 🛠️ Guidelines & Setup

📌 **Lưu ý quan trọng:**
* 📅 **Thời hạn nộp bài (Deadline):** `April 19, 2026`.
* 📦 **Yêu cầu mã nguồn:** Toàn bộ Visual Studio solution (`.sln`) và file cấu hình `.gitignore` phải được đẩy lên GitHub hoặc Azure Repos.

### Hướng dẫn triển khai cục bộ (Local Development)
1.  **🛢️ Khởi tạo Database:** Khởi chạy file script SQL hoặc chạy các lệnh Entity Framework Migration để tạo cấu trúc cơ sở dữ liệu. Đừng quên chạy script `seed data` để có dữ liệu ban đầu cho việc kiểm thử.
2.  **⚙️ Thiết lập Backend:** Cập nhật chuỗi kết nối (Connection Strings) tới SQL Server trong `appsettings.Development.json` và khai báo các khóa bí mật của JWT Auth.

### Triển khai & Kiểm thử (Cloud & Testing)
* **☁️ Cloud Deployment:** Thiết lập tài nguyên trên Microsoft Azure (Azure App Service, Azure Blob Storage). Xây dựng Pipeline CI/CD bằng **Azure DevOps** hoặc **GitHub Actions** để tự động hóa quá trình Build & Deploy.
* **🧪 Testing:** Code coverage cho các service backend phải đạt tối thiểu **60%**. Toàn bộ hệ thống khi nộp phải đính kèm báo cáo test và kết quả thực thi chi tiết.

### Hướng dẫn cài đặt
#### 1. Nhóm Backend & Database (Siêu cần thiết)
**SQL Server 2022 Express (Bản nhẹ cho sinh viên):**
https://go.microsoft.com/fwlink/p/?linkid=2215158&clcid=0x409&culture=en-us&country=us

**SQL Server Management Studio (SSMS) 20.1:**
https://aka.ms/ssmsfullsetup

#### 2. Nhóm Frontend & Editor (Giao diện React)
**Node.js 20.x (Bản LTS ổn định nhất):**
https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi

#### 3. Nhóm Công cụ hỗ trợ & Quản lý
**Git for Windows (64-bit): (Optional nhưng mà nên cài)**
https://github.com/git-for-windows/git/releases/download/v2.45.0.windows.1/Git-2.45.0-64-bit.exe

**Postman Desktop Agent (Dùng để test APIs và lưu trữ danh sách những API đã được viết):**
https://dl.pstmn.io/download/latest/win64

**Azure Data Studio: (tương tự như SSMS nhưng dễ xài hơn, ít tính năng hơn, cài SSMS rồi thì bỏ qua cũng được)**
https://go.microsoft.com/fwlink/?linkid=2263435
>>>>>>> ca1c4eeb82a97125ba9cdbbdd89db3d579c64242
