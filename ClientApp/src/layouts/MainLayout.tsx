import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import MobileNav from "../components/Navigation/MobileNav";
import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";
import { LayoutDashboard, Users, Bell, SquareUserRound, LogOut, Settings, Moon, UserRoundPen, ShieldAlert, MessageCircle } from "lucide-react";

const MainLayout: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { totalUnread } = useChat();

  const navItems = [
    { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Chat', path: '/chat', icon: MessageCircle, badge: totalUnread > 0 ? totalUnread : undefined },
    { name: 'Friends', path: '/friends', icon: Users },
    { name: 'Profile', path: '/profile', icon: SquareUserRound },
    { name: 'Moderation', path: '/admin/moderation', icon: ShieldAlert },
    {
      name: 'Setting',
      path: '#',
      icon: Settings,
      subitems: [
        { name: 'Edit Information', path: '/edit', icon: UserRoundPen },
        { name: 'Dark Mode', path: '#', icon: Moon },
        { name: 'Log Out', path: '/Login', icon: LogOut }
      ]
    }
  ];

  return (
    <div className={`flex min-h-screen w-full transition-colors duration-500
      ${isDark ? 'bg-gray-950 text-white' : 'bg-surface text-gray-900'}`} 
    > 
        {/* Mobile Navigation */}
        <MobileNav items={navItems} />

        {/* Sidebar: Chuyển sang ẩn trên mobile, hiện từ md (tablet) trở lên */}
        <aside className={`hidden md:block fixed md:sticky top-0 h-screen z-40 transition-all duration-500
          w-64 shrink-0 border-r
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sidebar'}`}>
            <Sidebar />
        </aside>
        
        <main className="flex-1 min-w-0 pb-20 md:pb-0 w-full md:w-auto">
            <div className="p-4 sm:p-6 lg:p-8 max-w-350 mx-auto">
                <Outlet /> 
            </div>
        </main>
    </div>
  );
};

export default MainLayout;