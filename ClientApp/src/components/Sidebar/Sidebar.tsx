import Logo from '../Logo.tsx';
import {Link} from 'react-router-dom';
import {LayoutDashboard, Users, Bell, SquareUserRound, LogOut, Settings, Moon, UserRoundPen, ShieldAlert} from "lucide-react";
import type { ISidebarItem } from '../../types/Sidebar';
import SidebarItem from './SidebarItem';
import { useTheme } from '../../context/ThemeContext';

const items: ISidebarItem[] = [
  { name: 'Dashboard', path: '/home', icon: LayoutDashboard },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Friends', path: '/friends', icon: Users },
  { name: 'Profile', path: '/profile', icon: SquareUserRound },
  { name: 'Moderation', path: '/admin/moderation', icon: ShieldAlert },
  {
    name: 'Setting',
    path: '#',
    icon: Settings,
    subitems:[
      { name: 'Edit Information', path: '/edit', icon: UserRoundPen },
      { name: 'Dark Mode', path: '#', icon: Moon },
      { name: 'Log Out', path: '/Login', icon: LogOut }
    ]
  }
]

const Sidebar = ({onClick}: {onClick?: () => void}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-64 p-4 flex flex-col transition-all duration-300
      ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className='flex flex-col space-y-6 w-full'>
        <Link to='/home' className="pl-3 py-2 flex justify-center md:justify-start">
          <Logo />
        </Link>
        <nav className="flex flex-col space-y-2 overflow-y-auto no-scrollbar">
          {items.map(item=>(
            <SidebarItem key={item.name} item={item} onClick={onClick}/> 
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar;