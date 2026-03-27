🌐 InteractHub - Social Media Web Application
InteractHub là một ứng dụng web mạng xã hội toàn diện, cho phép người dùng kết nối và tương tác trực tuyến. Dự án là bài tập lớn môn C# and .NET Development (Học kỳ Spring 2026), hạn nộp 19/04/2026.
✨ 1. Tính năng cốt lõi (Core Features)

    🔐 Tài khoản & Xác thực: Đăng ký và xác thực bảo mật.
    📝 Bài viết (Posts): Đăng trạng thái hỗ trợ cả văn bản và hình ảnh.
    ⏱️ Stories: Chia sẻ nội dung tạm thời.
    ❤️ Tương tác: Thích (Like), bình luận (Comment), và chia sẻ (Share) bài viết.
    👥 Bạn bè: Gửi và quản lý lời mời kết bạn.
    🔔 Thông báo: Nhận thông báo theo thời gian thực (Real-time).
    📈 Khám phá: Theo dõi các hashtag đang thịnh hành.
    🛡️ Kiểm duyệt: Báo cáo các nội dung không phù hợp dành cho Admin.

💻 2. Tech Stack
Frontend (React SPA)
	
Backend (ASP.NET Core Web API)
	
Cloud & DevOps
React 18+ & TypeScript
	
ASP.NET Core 8.0+
	
Microsoft Azure
Tailwind CSS
	
Entity Framework Core 8.0+ & SQL Server
	
Azure App Service & SQL DB
Context API / Redux Toolkit
	
JWT Authentication & Identity
	
Azure Blob Storage
React Router v6+
	
SignalR (Real-time)
	
CI/CD: GitHub Actions/Azure DevOps
Axios & React Hook Form
	
Swagger/OpenAPI
	
xUnit/NUnit & Moq (Testing)
🗄️ 3. Cấu trúc Cơ sở dữ liệu
Hệ thống bao gồm tối thiểu 8 thực thể (entities) có mối quan hệ chuẩn hóa cao:

    User: Kế thừa từ AspNetUsers của Identity.
    Post: Lưu trữ nội dung bài đăng.
    Comment: Bình luận thuộc về bài viết.
    Like: Tương tác yêu thích Post/Comment.
    Friendship: Quản lý trạng thái kết bạn.
    Story: Lưu trữ nội dung tạm thời.
    Notification: Quản lý thông báo hệ thống.
    Hashtag: Phân loại và tìm kiếm xu hướng.
    PostReport: Báo cáo nội dung xấu.

✅ 4. Danh sách yêu cầu (Checklist)
🎨 Frontend (4 Điểm)

    [ ] F1 (1đ): Kiến trúc Component (≥ 15 components) có interface rõ ràng & Responsive UI bằng Tailwind.
    [ ] F2 (1đ): Quản lý State (Redux/Context) & Gọi API bằng Axios, xử lý authentication.
    [ ] F3 (1đ): Forms & Validation (Dùng React Hook Form cho login, register, post...).
    [ ] F4 (1đ): Routing (React Router v6+), Protected Routes, Search debouncing & Pagination/Infinite scroll.

⚙️ Backend (4 Điểm)

    [ ] B1 (1đ): Thiết kế CSDL (≥ 8 entities) & Entity Framework Migrations.
    [ ] B2 (1đ): RESTful API Controllers (≥ 6 controllers, ≥ 20 endpoints) & DTOs.
    [ ] B3 (1đ): Xác thực bằng JWT & Phân quyền Role-based (User, Admin).
    [ ] B4 (1đ): Tách lớp Business Logic (≥ 5 services), Dependency Injection & Upload file Azure Blob.

🧪 Testing & CI/CD (2 Điểm)

    [ ] T1 (1đ): Unit Testing (xUnit/NUnit và Moq) với tối thiểu 60% coverage cho các services.
    [ ] D1 (1đ): Deploy ứng dụng lên Azure (App Service, SQL) & Setup auto CI/CD Pipeline bằng file YAML.

📦 5. Hướng dẫn nộp bài

    [ ] Source Code: File solution .sln, .gitignore, link Git repository có cấp quyền cho giảng viên.
    [ ] Database: Script khởi tạo DB, EF migration files, script seed data.
    [ ] Tài liệu: File README.md này, sơ đồ CSDL, tài liệu API, ≥ 10 ảnh chụp màn hình, Video demo tính năng (5-10 phút).
    [ ] Testing: Project test hoàn chỉnh & báo cáo test coverage.
    [ ] Deployment: Link ứng dụng đã live trên Azure, file YAML cấu hình CI/CD, tài liệu setup Azure.
    [ ] Định dạng nộp: Nén thành file Zip (tối đa 50MB, loại bỏ các thư mục node_modules, bin, obj).

📅 6. Lộ trình thực hiện (Khuyến nghị 7 Tuần)
Để kịp thời hạn nộp bài là 19/04/2026, dự án được phân chia theo chặng đường 7 tuần như sau:

    Tuần 1: Cấu hình thư mục dự án, thiết kế sơ đồ DB, Entity Framework Migrations & ASP.NET Identity.
    Tuần 2: Hoàn thiện Auth API, Posts API, DTOs & Khởi tạo cấu trúc Frontend React TypeScript.
    Tuần 3: Build giao diện UI, tích hợp React Hook Form, cấu hình State Management (Redux/Context).
    Tuần 4: Ráp API vào UI (Login, Load danh sách bài viết, Tạo bài mới), xử lý Like, Comment, Friendship.
    Tuần 5: Tích hợp Azure Blob Storage, kết nối SignalR cho thông báo Real-time, thêm Story & Hashtag.
    Tuần 6: Viết Unit Tests đảm bảo pass 60% coverage, xử lý các lỗi phát sinh, tối ưu hiệu năng UI.
    Tuần 7: Setup CI/CD, Deploy DB/App lên Azure, quay video demo, rà soát checklist & nộp file Zip.
