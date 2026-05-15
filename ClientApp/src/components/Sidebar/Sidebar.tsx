import Logo from '../Logo.tsx';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, SquareUserRound, LogOut, Settings, Moon, UserRoundPen, ShieldAlert } from "lucide-react";
import type { ISidebarItem } from '../../types/Sidebar';
import SidebarItem from './SidebarItem';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth'; 

const Sidebar = ({ onClick }: { onClick?: () => void }) => {
  const { roles: userRoles = [] } = useAuth(); // Default là mảng rỗng để tránh lỗi undefined
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems: ISidebarItem[] = [
    { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Friends', path: '/friends', icon: Users },
    { name: 'Profile', path: '/profile', icon: SquareUserRound },
    { 
      name: 'Moderation', 
      path: '/admin/moderation', 
      icon: ShieldAlert, 
      roles: ['Admin'] // Chỉ Admin mới thấy
    },
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

  // Lọc danh sách menu dựa trên quyền của user
  const filteredItems = menuItems.filter(item => {
    // Nếu item không yêu cầu quyền cụ thể, hiển thị cho tất cả
    if (!item.roles || item.roles.length === 0) return true;
    
    // Nếu có yêu cầu quyền, kiểm tra xem userRoles có chứa ít nhất một quyền hợp lệ không
    return item.roles.some(role => userRoles.includes(role));
  });

  return (
    <div className={`h-screen w-64 p-4 flex flex-col transition-all duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className='flex flex-col space-y-6 w-full overflow-hidden'>
        <Link to='/home' className="pl-3 py-2 flex justify-center md:justify-start">
          <Logo />
        </Link>
        <nav className="flex flex-col space-y-2 overflow-y-auto no-scrollbar">
          {filteredItems.map(item => (
            <SidebarItem key={item.name} item={item} onClick={onClick} />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;