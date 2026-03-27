
--------------------------------------------------------------------------------
InteractHub - Social Media Web Application
1. Tổng quan dự án
InteractHub là một ứng dụng web mạng xã hội toàn diện (Single Page Application - SPA) được phát triển nhằm kết nối người dùng thông qua các tương tác trực tuyến. Dự án này kết hợp chặt chẽ giữa Frontend hiện đại và Backend mạnh mẽ để mang lại trải nghiệm mượt mà và bảo mật cho người dùng.
Các tính năng cốt lõi bao gồm:

    Tạo tài khoản và xác thực bảo mật.
    Đăng bài viết (trạng thái) hỗ trợ cả văn bản và hình ảnh.
    Chia sẻ story (nội dung tạm thời).
    Tương tác với bài viết: Thích (Like), bình luận (Comment), và chia sẻ (Share).
    Gửi và quản lý lời mời kết bạn.
    Nhận thông báo theo thời gian thực (Real-time notifications).
    Quản lý hồ sơ người dùng (Profile) và cài đặt.
    Theo dõi các hashtag đang thịnh hành (Trending hashtags).
    Báo cáo các nội dung không phù hợp (dành cho quản trị viên kiểm duyệt).

2. Tech Stack
Dự án sử dụng các công nghệ tiêu chuẩn của ngành cho cả Frontend, Backend và quy trình DevOps:
Frontend (Client-side):

    Framework/Ngôn ngữ: React 18+ kết hợp TypeScript (bật strict mode).
    Styling: Tailwind CSS (ưu tiên thiết kế Mobile-first, Responsive).
    Quản lý State: React Context API hoặc Redux Toolkit.
    Routing: React Router v6+.
    Xử lý Form & HTTP: React Hook Form (để validate form), Axios/Fetch API (gọi API).
    Build Tool: Vite hoặc Create React App.

Backend (Server-side):

    Framework: ASP.NET Core 8.0+ Web API (Kiến trúc RESTful API với Repository và Service patterns).
    Cơ sở dữ liệu & ORM: SQL Server, Entity Framework Core 8.0+.
    Xác thực & Phân quyền: JWT (JSON Web Tokens) kết hợp với ASP.NET Core Identity (Hỗ trợ Role-based/Policy-based).
    Real-time & Tài liệu API: SignalR (cho thông báo thời gian thực) và Swagger/OpenAPI.

Cloud & DevOps:

    Nền tảng Cloud: Microsoft Azure (Azure App Service, Azure SQL Database).
    Lưu trữ file: Azure Blob Storage (chứa hình ảnh, file upload).
    CI/CD Pipeline: Azure DevOps hoặc GitHub Actions.

3. Danh sách yêu cầu (Checklist)
Frontend (4 Điểm)

    [ ] F1: Kiến trúc Component & Responsive (1đ): Xây dựng ít nhất 15 React components có interface TypeScript rõ ràng, responsive bằng Tailwind CSS.
    [ ] F2: Quản lý State & Gọi API (1đ): Thiết lập Context/Redux, tạo API service với Axios, quản lý trạng thái authentication/loading/error.
    [ ] F3: React Forms & Validation (1đ): Dùng React Hook Form cho đăng nhập, đăng ký, tạo bài viết; validate phía client với thông báo lỗi rõ ràng.
    [ ] F4: Routing & Tính năng động (1đ): Phân quyền route (Protected routes), làm chức năng tìm kiếm (debounce), phân trang/infinite scroll, tích hợp nhận thông báo qua SignalR.

Backend (4 Điểm)

    [ ] B1: CSDL & Entity Framework (1đ): Cấu hình DbContext, viết migrations, setup relationship và seed data cơ bản.
    [ ] B2: RESTful API Controllers & DTOs (1đ): Hoàn thiện tối thiểu 6 controllers và 20 endpoints với DTOs, cấu hình CORS, tích hợp Swagger.
    [ ] B3: JWT Authentication & Authorization (1đ): Setup ASP.NET Identity, cấp phát JWT khi login, phân quyền Role-based (User/Admin).
    [ ] B4: Business Logic & Services (1đ): Tạo ít nhất 5 classes ở Service layer (PostsService, FriendsService...), áp dụng Dependency Injection, làm tính năng upload file lên Azure Blob.

Testing & CI/CD (2 Điểm)

    [ ] T1: Unit Testing (1đ): Dùng xUnit/NUnit và Moq, đạt mức bao phủ code (coverage) tối thiểu 60% cho services.
    [ ] D1: Deploy & CI/CD (1đ): Setup GitHub Actions/Azure DevOps tự động deploy lên Azure App Service và Azure SQL DB.

4. Cấu trúc Cơ sở dữ liệu
Hệ thống yêu cầu thiết kế tối thiểu 8 thực thể (entities) có mối quan hệ chuẩn hóa cao (One-to-Many, Many-to-Many):

    User: Kế thừa từ AspNetUsers của Identity, lưu thông tin người dùng.
    Post: Lưu bài đăng của người dùng (nội dung, hình ảnh, thời gian).
    Comment: Bình luận thuộc về bài viết và người dùng.
    Like: Thể hiện tương tác yêu thích đối với Post/Comment.
    Friendship: Quản lý trạng thái kết bạn (Pending, Accepted...).
    Story: Lưu trữ nội dung tạm thời (sẽ biến mất sau 24h).
    Notification: Quản lý thông báo hệ thống (có người like, comment...).
    Hashtag: Phân loại và tìm kiếm xu hướng bài viết.
    PostReport: Lưu trữ các báo cáo nội dung xấu dành cho Admin kiểm duyệt.

5. Hướng dẫn nộp bài
Theo yêu cầu dự án, file nộp phải ở định dạng nén Zip (tối đa 50MB, loại bỏ các thư mục node_modules, bin, obj) và bao gồm các thành phần sau:

    Source Code: Visual Studio Solution (.sln), đầy đủ source Frontend/Backend, cung cấp link Git repository (GitHub/Azure Repos) cấp quyền truy cập cho giảng viên.
    Database: Script tạo DB, các file migration của EF, và script seed data.
    Tài liệu (Documentation): File README.md (chính là file này), sơ đồ CSDL, tài liệu API, ít nhất 10 ảnh chụp màn hình, và video demo ứng dụng (5-10 phút).
    Testing: Test project chạy được, đi kèm report báo cáo độ bao phủ code (coverage).
    Deployment: Link ứng dụng đã live trên Azure, file cấu hình CI/CD (YAML), và tài liệu thiết lập biến môi trường.

6. Lộ trình thực hiện gợi ý (7 Tuần)
Để kịp hạn chót nộp bài là ngày 19/04/2026, dự án được chia nhỏ thành chặng đua 7 tuần:

    Tuần 1 (Tập trung DB & Setup): Khởi tạo Solution, thiết lập kiến trúc dự án. Tạo sơ đồ DB, code EF Core Models, Migrations. Thiết lập ASP.NET Identity.
    Tuần 2 (Core Backend & API): Viết các API cho Auth (JWT login/register), Posts, Comments. Cấu hình DTOs, Repository/Service pattern. Khởi tạo React TypeScript với Vite, setup Tailwind, cấu trúc folder Frontend.
    Tuần 3 (UI & State Management): Build UI Frontend. Tích hợp React Hook Form để validate các form Auth và Post. Setup Redux/Context API và bộ Axios interceptor.
    Tuần 4 (Ghép nối & Tương tác): Ráp API với UI (Đăng nhập, hiện Feed, Đăng bài). Hoàn thiện Like, Share, Comment, và chức năng kết bạn (Friendship logic).
    Tuần 5 (Tính năng Nâng cao): Tích hợp Azure Blob Storage để upload ảnh. Gắn SignalR vào Backend và Frontend để push Real-time Notification. Thêm chức năng Story và Hashtag.
    Tuần 6 (Testing & Refactoring): Viết Unit Tests (xUnit + Moq) đảm bảo pass 60% coverage. Tối ưu UX/UI (thêm Skeleton loading, phân trang/infinite scroll). Bắt và xử lý lỗi chặt chẽ.
    Tuần 7 (CI/CD, Deploy & Đóng gói nộp bài): Setup Azure Services (App Service, SQL, Blob). Viết file YAML CI/CD chạy auto deploy. Quay video demo, hoàn thiện tài liệu, nộp bài bản Zip trước ngày 19/04/2026.


--------------------------------------------------------------------------------
