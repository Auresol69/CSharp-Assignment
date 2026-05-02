import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { useTheme } from "../context/ThemeContext"; // Import context để đồng bộ theme

const MainLayout: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex min-h-screen w-full transition-colors duration-500
      /* Sử dụng màu surface bạn đã định nghĩa trong config cho Light Mode */
      ${isDark ? 'bg-gray-950' : 'bg-surface'}`} 
    > 
        <aside className={`sticky top-0 h-screen w-64 shrink-0 border-r transition-colors duration-500
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sidebar'}`}>
            <Sidebar />
        </aside>
        
        <main className="flex-1 min-w-0">
            <div className="p-4 md:p-6">
                <Outlet /> 
            </div>
        </main>
    </div>
  );
};

export default MainLayout;