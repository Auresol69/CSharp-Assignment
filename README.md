# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

<<<<<<< HEAD
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
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
>>>>>>> ca1c4eeb82a97125ba9cdbbdd89db3d579c64242
