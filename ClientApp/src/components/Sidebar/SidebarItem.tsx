import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {ChevronDown} from 'lucide-react';
import type { ISidebarItem,} from '../../types/Sidebar';
import SidebarSubItem from './SidebarSubItem';

const SidebarItem = ({ item, onClick }: { item: ISidebarItem, onClick?: () => void}) => {
  const { name, icon: Icon, path, subitems } = item;
  const hasSubitems = subitems && subitems.length > 0;
  const [expanded, setExpanded] = useState(false);

  // Class dùng chung để giao diện đồng nhất
  const commonClasses = "flex items-center cursor-pointer rounded-lg p-4 justify-between transition-all hover:text-black hover:bg-gray-200";

  // Hàm đóng mở menu con
  const handleToggle = () => {setExpanded(!expanded);};
  const handleOnClick = () => {
    if (path.toLowerCase() === '/home' || path === '/') {
      // 1. Phát tín hiệu Custom Event để Home.tsx nhận biết
      const event = new CustomEvent('reload-dashboard');
      window.dispatchEvent(event);
      
      // 2. Gọi callback onClick nếu có truyền từ Sidebar.tsx
      if (onClick) onClick();
    }
  };

  // Nếu có menu con, dùng div để click mở rộng
  if (hasSubitems) {
    return (
      <>
        <div className={`${commonClasses}`} onClick={handleToggle}>
          <div className='flex items-center space-x-2'>
              <Icon size={23}/>
              <p className='font-semibold'>{name}</p>
          </div>
          <ChevronDown className={`mt-1 transition-transform duration-300 ${expanded ? '-rotate-90': ''}`} size={20}/>
        </div>
        {expanded && subitems && (
          <div className="flex flex-col ml-10 mt-1 space-y-1">
            {subitems.map((sub) => (
              <SidebarSubItem 
                key={sub.name} 
                name={sub.name} 
                path={sub.path} 
                icon={sub.icon} 
              />
            ))}
          </div>
        )}
      </>
    );
  }
  
  return (
    <NavLink 
      to={path} 
      end= {path === '/'}
      onClick={handleOnClick}
      className={({ isActive }) => 
        `${commonClasses} ${isActive ? 'bg-gray-200 font-bold scale-105 text-black' : 'hover:bg-gray-200 text-gray-700'}`
      }
    >
      <div className='flex items-center space-x-2'>
          <Icon size={23}/>
          <p className='font-semibold'>{name}</p>
      </div>
    </NavLink>
  );
};
export default SidebarItem;
