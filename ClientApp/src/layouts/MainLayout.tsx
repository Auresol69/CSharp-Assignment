import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useTheme } from "../context/ThemeContext";

const MainLayout: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex min-h-screen w-full transition-colors duration-500
      ${isDark ? 'bg-gray-950 text-white' : 'bg-surface text-gray-900'}`} 
    > 
        {/* Sidebar: Chuyển sang ẩn trên mobile, hiện từ md (tablet) trở lên */}
        <aside className={`fixed md:sticky top-0 h-screen z-40 transition-all duration-500
          -translate-x-full md:translate-x-0 w-64 shrink-0 border-r
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sidebar'}`}>
            <Sidebar />
        </aside>
        
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
            <div className="p-4 sm:p-6 lg:p-8 max-w-350 mx-auto">
                <Outlet /> 
            </div>
        </main>

        {/* Mobile Bottom Navigation (Hiện khi màn hình < 768px) */}
        <div className={`md:hidden fixed bottom-0 w-full h-16 border-t z-50 flex items-center justify-around px-4
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            {/* Thêm các NavLink rút gọn tại đây */}
        </div>
    </div>
  );
};

export default MainLayout;