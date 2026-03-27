# 🎓 InteractHub — Social Media Web Application

> [cite_start]Đồ án môn **C# and .NET Development** — Khoa Công nghệ Thông tin — Trường Đại học Sài Gòn [cite: 1, 7]

---

## 📌 Tổng quan dự án

[cite_start]**InteractHub** là nền tảng mạng xã hội hiện đại cho phép người dùng kết nối, chia sẻ nội dung và tương tác trong thời gian thực[cite: 28, 40]. [cite_start]Dự án được xây dựng theo mô hình **Full-stack** với kiến trúc Single Page Application (SPA) kết hợp cùng RESTful API mạnh mẽ, triển khai hoàn toàn trên hạ tầng đám mây Azure[cite: 29, 37, 65].

---

## 🛠 Công nghệ sử dụng (Technology Stack)

| Thành phần | Công nghệ | Chi tiết |
|:---|:---|:---|
| **Frontend** | **React 18+** | [cite_start]TypeScript (Strict mode), Tailwind CSS, React Router v6+[cite: 55, 56, 58, 61]. |
| **Backend** | **ASP.NET Core 8.0+** | [cite_start]Web API, RESTful Architecture, SignalR (Real-time)[cite: 68, 69, 76]. |
| **Database** | **SQL Server** | [cite_start]Entity Framework Core 8.0+ (Code First)[cite: 70, 71]. |
| **Security** | **JWT & Identity** | [cite_start]JSON Web Tokens với ASP.NET Core Identity[cite: 72, 254]. |
| **Cloud/DevOps** | **Microsoft Azure** | [cite_start]App Service, Blob Storage, GitHub Actions / Azure DevOps[cite: 78, 79, 80]. |

---

## 🗄️ Cấu trúc cơ sở dữ liệu (Database Schema)

[cite_start]Hệ thống yêu cầu thiết kế tối thiểu 8 thực thể với các mối quan hệ chặt chẽ[cite: 193, 196]:

* [cite_start]**User**: Kế thừa `IdentityUser` quản lý tài khoản và định danh[cite: 203, 268].
* [cite_start]**Post**: Bài viết trạng thái bao gồm văn bản và hình ảnh[cite: 204].
* [cite_start]**Comment & Like**: Hệ thống tương tác và phản hồi trên bài viết[cite: 205, 206].
* [cite_start]**Friendship**: Quản lý lời mời và danh sách bạn bè[cite: 207].
* [cite_start]**Story**: Chia sẻ nội dung tạm thời (biến mất sau thời gian nhất định)[cite: 208].
* [cite_start]**Notification**: Thông báo thời gian thực qua SignalR[cite: 209].
* [cite_start]**Hashtag**: Theo dõi và thống kê các xu hướng thịnh hành[cite: 210].
* [cite_start]**PostReport**: Ghi nhận báo cáo vi phạm phục vụ kiểm duyệt (Admin)[cite: 211].

---

## 📁 Cấu trúc thư mục (Project Structure)

```text
InteractHub/
├── ClientApp/               # Frontend SPA (React + TypeScript) [cite: 65]
│   ├── src/
│   │   ├── components/      # Các UI component dùng chung [cite: 89, 92]
│   │   ├── pages/           # Các trang (Home, Profile, Login...) [cite: 92]
│   │   ├── services/        # API service layer (Axios) [cite: 114, 123]
│   │   ├── hooks/           # Custom hooks cho logic xử lý [cite: 93, 100]
│   │   └── context/         # Quản lý trạng thái toàn cục (Context API/Redux) [cite: 113, 122]
├── InteractHub.API/         # Backend Web API (ASP.NET Core) [cite: 68]
│   ├── Controllers/         # Các Endpoint xử lý yêu cầu HTTP [cite: 229]
│   ├── DTOs/                # Đối tượng chuyển đổi dữ liệu [cite: 232, 239]
│   ├── Services/            # Lớp xử lý nghiệp vụ (Business Logic) [cite: 281, 284]
│   ├── Data/                # EF Core DbContext và Migrations [cite: 197, 198]
│   └── Program.cs           # Cấu hình Middleware, Auth và DI [cite: 240, 267]
└── InteractHub.Tests/       # Unit Testing project (xUnit/NUnit) [cite: 310, 318]
