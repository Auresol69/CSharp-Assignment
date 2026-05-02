import { useTheme } from '../context/ThemeContext'; // Đảm bảo đúng đường dẫn tới context của bạn

const Logo = () => {
  const { theme } = useTheme(); 
  const isDark = theme === 'dark';

  return (
    <svg 
      viewBox="0 0 90 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-12 w-fit transition-all duration-300"
    >
      {/* Giữ nguyên màu xanh cho các icon hình học */}
      <circle cx="10" cy="10" r="4" fill="#3b82f6" />
      <rect x="6" y="16" width="8" height="20" rx="2" fill="#3b82f6" />
      
      {/* Thay đổi màu chữ "Hub" dựa trên trạng thái theme */}
      <text 
        x="18" y="36" 
        fill={isDark ? "#FFFFFF" : "#111827"} 
        fontFamily="Arial, sans-serif" 
        fontSize="32" 
        fontWeight="900"
        className="transition-colors duration-300"
      >
        Hub
      </text>
    </svg>
  );
};

export default Logo;