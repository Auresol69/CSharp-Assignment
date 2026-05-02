import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {ChevronDown} from 'lucide-react';
import type { ISidebarItem } from '../../types/Sidebar';
import SidebarSubItem from './SidebarSubItem';
import { useTheme } from '../../context/ThemeContext';

const SidebarItem = ({ item, onClick }: { item: ISidebarItem, onClick?: () => void}) => {
  const { theme } = useTheme(); 
  const isDark = theme === 'dark';
  const { name, icon: Icon, path, subitems } = item;
  const [expanded, setExpanded] = useState(false);

  const getDynamicClasses = (isActive: boolean) => {
    const base = "flex items-center cursor-pointer rounded-xl p-3.5 justify-between transition-all duration-200";
    const colors = isDark 
      ? `${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
      : `${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`;
    const font = isActive ? "font-bold" : "font-medium";
    return `${base} ${colors} ${font}`;
  };

  if (subitems && subitems.length > 0) {
    return (
      <div className='flex flex-col space-y-1'>
        <div className={getDynamicClasses(expanded)} onClick={() => setExpanded(!expanded)}>
          <div className='flex items-center space-x-3'>
              <Icon size={22}/>
              <p className='text-[15px]'>{name}</p>
          </div>
          <ChevronDown className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18}/>
        </div>
        {expanded && (
          <div className={`flex flex-col ml-9 mt-1 space-y-1 border-l ${isDark ? 'border-gray-800' : 'border-gray-100'} pl-3`}>
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
      onClick={onClick}
    >
      <div className='flex items-center space-x-3'>
          <Icon size={22}/>
          <p className='text-[15px]'>{name}</p>
      </div>
    </NavLink>
  );
};

export default SidebarItem;