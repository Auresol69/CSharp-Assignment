# 🌐 InteractHub - Social Media Web Application
> **Đồ án môn học - Đại học Sài Gòn (SGU)**

InteractHub là một ứng dụng mạng xã hội hiện đại được xây dựng với kiến trúc Single Page Application (SPA) kết hợp cùng Web API mạnh mẽ, cung cấp trải nghiệm kết nối, chia sẻ và tương tác theo thời gian thực cho người dùng.

---

## 🚀 Technology Stack

| Thành phần | 🛠️ Công nghệ sử dụng |
| :--- | :--- |
| **💻 Frontend** | React 18+, TypeScript (Strict Mode), Tailwind CSS, React Router v6+. |
| **⚙️ Backend** | ASP.NET Core 8.0+ Web API, RESTful API, JWT Auth, SignalR. |
| **🛢️ Database** | Entity Framework Core 8.0+, SQL Server. |
| **☁️ Cloud & DevOps** | Microsoft Azure, Azure DevOps / GitHub Actions, Azure Blob Storage. |

---

## 🗄️ Database Schema

Hệ thống được thiết kế chặt chẽ với tối thiểu **8 thực thể** có mối quan hệ với nhau:

* 👤 **User**: Quản lý người dùng (Sử dụng `AspNetUsers` kết hợp ASP.NET Core Identity).
* 📝 **Post**: Lưu trữ các bài viết/trạng thái của người dùng.
* 💬 **Comment**: Quản lý luồng bình luận trên các bài viết.
* ❤️ **Like**: Ghi nhận lượt thích/tương tác trên bài viết.
* 🤝 **Friendship**: Quản lý trạng thái mối quan hệ và các yêu cầu kết bạn.
* ⏱️ **Story**: Lưu trữ nội dung chia sẻ dạng tạm thời (Stories).
* 🔔 **Notification**: Quản lý thông báo hệ thống gửi đến người dùng.
* #️⃣ **Hashtag**: Thống kê các thẻ xu hướng (trending) được sử dụng.
* ⚠️ **PostReport**: Ghi nhận các báo cáo vi phạm để quản trị viên kiểm duyệt.

---

## 📂 Project Structure

Kiến trúc thư mục được phân chia rõ ràng giữa Client và Backend:

```text
InteractHub/
├── ClientApp/               # Single Page Application (React + TypeScript)
│   ├── src/
│   │   ├── components/      # Các React component có thể tái sử dụng
│   │   ├── pages/           # Các component đóng vai trò là trang (Routing)
│   │   ├── layouts/         # Các bố cục giao diện dùng chung
│   │   ├── utils/           # Các hàm tiện ích và custom hooks
│   │   └── services/        # Cấu hình Axios và lớp giao tiếp API
│
├── InteractHub.API/         # Backend Web API (ASP.NET Core)
│   ├── Controllers/         # Các RESTful API Controllers xử lý HTTP request
│   ├── DTOs/                # Data Transfer Objects (Request/Response)
│   ├── Models/              # Các Entity class ánh xạ với Database
│   ├── Services/            # Lớp Business Logic và Dependency Injection
│   ├── Data/                # Cấu hình EF Core DbContext và Migrations
│   └── Program.cs           # Khởi động, cấu hình middleware và JWT
│
└── InteractHub.Tests/       # Các bài kiểm thử Unit Test (xUnit/NUnit)
```

---

## ✨ Core Features

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
