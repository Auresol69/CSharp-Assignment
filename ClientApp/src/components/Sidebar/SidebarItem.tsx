import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {ChevronDown} from 'lucide-react';
import type { ISidebarItem,} from '../../types/Sidebar';
import SidebarSubItem from './SidebarSubItem';
import { useTheme } from '../../context/ThemeContext';


const SidebarItem = ({ item, onClick }: { item: ISidebarItem, onClick?: () => void}) => {
  const { theme } = useTheme(); //
  const isDark = theme === 'dark';
  const { name, icon: Icon, path, subitems } = item;
  const [expanded, setExpanded] = useState(false);

  // Tạo class động dựa trên trạng thái Dark/Light[cite: 10, 11]
  const getDynamicClasses = (isActive: boolean) => {
    const base = "flex items-center cursor-pointer rounded-lg p-4 justify-between transition-all duration-200";
    const colors = isDark 
      ? `${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
      : `${isActive ? 'bg-gray-200 text-black' : 'text-gray-700 hover:bg-gray-100 hover:text-black'}`;
    const scale = isActive ? "font-bold scale-105" : "";
    return `${base} ${colors} ${scale}`;
  };

  if (subitems && subitems.length > 0) {
    return (
      <div className='flex flex-col space-y-1'>
        <div className={getDynamicClasses(expanded)} onClick={() => setExpanded(!expanded)}>
          <div className='flex items-center space-x-2'>
              <Icon size={23}/>
              <p className='font-semibold'>{name}</p>
          </div>
          <ChevronDown className={`transition-transform ${expanded ? '-rotate-90' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20}/>
        </div>
        {expanded && (
          <div className={`flex flex-col ml-6 mt-1 space-y-1 border-l-2 ${isDark ? 'border-gray-800' : 'border-gray-100'} pl-4`}>
            {subitems.map((sub) => (
              <SidebarSubItem key={sub.name} name={sub.name} path={sub.path} icon={sub.icon} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <NavLink 
      to={path} 
      className={({ isActive }) => getDynamicClasses(isActive)}
      onClick={() => {/* logic handleOnClick giữ nguyên */}}
    >
      <div className='flex items-center space-x-2'>
          <Icon size={23}/>
          <p className='font-semibold'>{name}</p>
      </div>
    </NavLink>
  );
};
export default SidebarItem;
