/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  // 1. Quét tất cả các file có thể chứa class Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét sạch từ components, layouts đến pages
  ],

  theme: {
    // 2. Mở rộng cấu hình mặc định (Không ghi đè)
    extend: {
      // Thêm màu sắc đặc trưng cho InteractHub
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Màu xanh chủ đạo của Facebook/iHub
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: '#f8fafc', // Màu nền nhạt cho background chính
      },

      // Tùy chỉnh font chữ cho chuyên nghiệp
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Định nghĩa lại hoặc thêm mới Shadow nếu muốn "xịn" hơn
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'sidebar': '1px 0 10px 0 rgba(0,0,0,0.05)',
      },

      // Cấu hình Animation cho các thông báo (Notifications)
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      }
    },
  },

  // 3. Plugins hỗ trợ làm giao diện nhanh hơn
  plugins: [
    // require('@tailwindcss/forms'), // Nếu ông có dùng nhiều form input
    // require('@tailwindcss/typography'), // Nếu có dùng nội dung bài viết dài
  ],
}
