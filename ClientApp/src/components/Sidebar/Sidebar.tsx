import LogoApp from '../../assets/logo.svg';
import {Link} from 'react-router-dom';
import {LayoutDashboard, Users, Bell, SquareUserRound, CircleFadingPlus, LogOut, Settings, Moon, UserRoundPen} from "lucide-react";
import type { ISidebarItem } from '../../types/Sidebar';
import SidebarItem from './SidebarItem';
const items: ISidebarItem[] = [
  {
    name: 'Dashboard',
    path: '/home',
    icon: LayoutDashboard ,
  },
  {
    name: 'Stories',
    path: '/stories',
    icon: CircleFadingPlus
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
  return (
    <div className='fixed top-0 left-0 h-screen w-[256px] bg-white shadow-lg z-10 p-4'>
      <div className='flex flex-col space-y-10 w-full'>
        <Link to='/home'>
          <img className='h-12 w-fit pl-3' src={LogoApp} alt="Logo" />
        </Link>
        <div className='flex flex-col space-y-6'>
          {items.map(item=>(
            <SidebarItem key={item.name} item={item} onClick={onClick}/> 
        ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar