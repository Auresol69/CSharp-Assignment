import Logo from '../Logo.tsx';
import {Link} from 'react-router-dom';
import {LayoutDashboard, Users, Bell, SquareUserRound, LogOut, Settings, Moon, UserRoundPen} from "lucide-react";
import type { ISidebarItem } from '../../types/Sidebar';
import SidebarItem from './SidebarItem';
import { useTheme } from '../../context/ThemeContext'; // Import context để đồng bộ theme

const items: ISidebarItem[] = [
  {
    name: 'Dashboard',
    path: '/home',
    icon: LayoutDashboard ,
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell
  },
  {
    name: 'Friends',
    path: '/friends',
    icon: Users,
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: SquareUserRound,
  },
  {
    name: 'Setting',
    path: '#',
    icon: Settings,
    subitems:[
      {
        name: 'Edit Information',
        path: '/edit',
        icon: UserRoundPen
      },
      {
        name: 'Dark Mode',
        path: '#',
        icon: Moon
      },
      {
        name: 'Log Out',
        path: '/Login',
        icon: LogOut
      }
    ]
  }
]

const Sidebar = ({onClick}: {onClick?: () => void}) => {
  const { theme } = useTheme(); // Lấy theme để ép render lại khi đổi trạng thái
  const isDark = theme === 'dark';

  return (
    <div className={`fixed top-0 left-0 h-screen w-[256px] shadow-lg z-10 p-4 transition-all duration-300
      ${isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-100'}`}>
      <div className='flex flex-col space-y-8 w-full'>
        <Link to='/home'className="pl-3">
          <Logo />
        </Link>
        <div className="flex flex-col space-y-4">
          {items.map(item=>(
            <SidebarItem key={item.name} item={item} onClick={onClick}/> 
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar;

