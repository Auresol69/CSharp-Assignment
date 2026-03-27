# InteractHub - Social Media Web Application (Đại học Sài Gòn) [1, 2]

## Technology Stack

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | React 18+, TypeScript (bật strict mode), Tailwind CSS, React Router v6+ [3]. |
| **Backend** | ASP.NET Core 8.0+ Web API, RESTful API, JWT Auth, SignalR [4]. |
| **Database** | Entity Framework Core 8.0+, SQL Server [4]. |
| **Cloud & DevOps** | Microsoft Azure, Azure DevOps / GitHub Actions, Azure Blob Storage [4, 5]. |

### Database Schema

Hệ thống yêu cầu thiết kế cơ sở dữ liệu với tối thiểu 8 thực thể có quan hệ với nhau [6]:

*   **User**: Sử dụng `AspNetUsers` kết hợp ASP.NET Core Identity để quản lý người dùng [4, 7].
*   **Post**: Lưu trữ các bài viết trạng thái của người dùng [7].
*   **Comment**: Quản lý các bình luận trên bài viết [7].
*   **Like**: Ghi nhận lượt thích trên các bài viết [7].
*   **Friendship**: Quản lý mối quan hệ và các yêu cầu kết bạn [7].
*   **Story**: Lưu trữ nội dung tạm thời (Stories) do người dùng chia sẻ [7].
*   **Notification**: Quản lý các thông báo hệ thống gửi đến người dùng [7].
*   **Hashtag**: Thống kê các thẻ xu hướng được sử dụng [7].
*   **PostReport**: Ghi nhận các báo cáo vi phạm để quản trị viên kiểm duyệt [7].

## Project Structure

Dưới đây là sơ đồ cấu trúc thư mục tổng quan cho cả phía Client và Backend [8-10]:

    InteractHub/
    ├── ClientApp/               # Single Page Application với React và TypeScript [3]
    │   ├── src/
    │   │   ├── components/      # Chứa các React component có thể tái sử dụng [8]
    │   │   ├── pages/           # Các component đóng vai trò là trang trong routing [8]
    │   │   ├── layouts/         # Các bố cục giao diện dùng chung [8]
    │   │   ├── utils/           # Các hàm tiện ích và custom hooks [8]
    │   │   └── services/        # Cấu hình Axios và lớp giao tiếp API [11]
    ├── InteractHub.API/         # Backend Web API bằng ASP.NET Core [4]
    │   ├── Controllers/         # Các RESTful API Controllers xử lý HTTP request [9]
    │   ├── DTOs/                # Data Transfer Objects dùng cho request và response [9]
    │   ├── Models/              # Các Entity class ánh xạ với CSDL [7]
    │   ├── Services/            # Lớp Business Logic và Dependency Injection [10]
    │   ├── Data/                # Cấu hình EF Core DbContext và Migrations [6]
    │   └── Program.cs           # File khởi động, cấu hình middleware và JWT [12, 13]
    └── InteractHub.Tests/       # Các bài kiểm thử Unit Test sử dụng xUnit/NUnit [14]

## Core Features

| Tính năng | Mô tả chi tiết |
| :--- | :--- |
| **Authentication** | Tạo tài khoản, đăng nhập an toàn bảo mật sử dụng JWT [2, 4]. |
| **Posts** | Đăng các cập nhật trạng thái bao gồm cả văn bản và hình ảnh [2]. |
| **Interactions** | Cho phép người dùng thích, bình luận và chia sẻ bài viết [2]. |
| **Stories** | Chia sẻ các nội dung mang tính chất tạm thời [2]. |
| **Friends** | Gửi, nhận và quản lý các yêu cầu kết bạn [2]. |
| **Real-time Notifications**| Nhận thông báo theo thời gian thực (real-time) thông qua SignalR [2, 4]. |
| **Profile Management** | Cập nhật hồ sơ cá nhân và thay đổi cài đặt người dùng [2]. |
| **Moderation & Hashtags** | Theo dõi hashtag thịnh hành và báo cáo các nội dung không phù hợp [2]. |

## Guidelines & Setup

*   **Thời hạn nộp bài (Deadline):** April 19, 2026 [1].
*   **Yêu cầu mã nguồn:** Toàn bộ Visual Studio solution (`.sln`) và file cấu hình `.gitignore` phải được đẩy lên GitHub hoặc Azure Repos [15].
*   **Khởi tạo Database:** Khởi chạy file script SQL hoặc chạy các lệnh Entity Framework migration để tạo cấu trúc cơ sở dữ liệu. Cần chạy script seed data để có dữ liệu ban đầu cho việc kiểm thử [15].
*   **Thiết lập Backend:** Cấu hình chuỗi kết nối (connection strings) tới SQL Server và khai báo các khóa bí mật của JWT Auth trong môi trường phát triển [5, 13].
*   **Triển khai Đám mây (Cloud Deployment):** Thiết lập tài nguyên trên Microsoft Azure bao gồm Azure App Service và Azure Blob Storage [5]. Xây dựng 파ipeline tự động CI/CD (Azure DevOps hoặc GitHub Actions) để tự động hóa quá trình build và deploy [5].
*   **Kiểm thử (Testing):** Code coverage cho các service backend phải đạt tối thiểu 60%; hệ thống phải được đính kèm báo cáo test và kết quả thực thi [14, 16].
