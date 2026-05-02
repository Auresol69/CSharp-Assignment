import { NavLink } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Import Hook để lấy theme và toggleTheme từ Context

interface ISubItemProps {
  name: string;
  path: string;
  icon: LucideIcon;
}

const SidebarSubItem = ({ name, path, icon: Icon }: ISubItemProps) => {
  const { theme, toggleTheme } = useTheme(); //[cite: 11]
  const isDark = theme === 'dark';

  const subItemClass = `flex items-center w-full space-x-2 p-3 rounded-lg transition-all text-sm font-medium
    ${isDark 
      ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`;

  if (name === 'Dark Mode') {
    return (
      <button type="button" onClick={toggleTheme} className={subItemClass}>
        <Icon size={18} />
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    );
  }



  return (
    <NavLink to={path} className={({ isActive }) => 
      `${subItemClass} ${isActive ? (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black font-bold') : ''}`}>
      <Icon size={18} />
      <span>{name}</span>
    </NavLink>
  );
};

export default SidebarSubItem;
