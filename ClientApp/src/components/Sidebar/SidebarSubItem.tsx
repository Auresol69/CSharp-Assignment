import { NavLink } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface ISubItemProps {
  name: string;
  path: string;
  icon: LucideIcon;
}

const SidebarSubItem = ({ name, path, icon: Icon }: ISubItemProps) => {
  // Logic xử lý trường hợp đặc biệt như Dark Mode (#)
  if (path === "#") {
    return (
      <div className="flex items-center space-x-3 p-3 -ml-5 -mt-5 rounded-lg transition-all text-gray-500 hover:text-black hover:bg-gray-100 cursor-pointer">
        <Icon size={18} />
        <span className="text-sm font-medium">{name}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg transition-all -ml-5 -mt-5 ${
          isActive ? 'bg-gray-200 font-bold scale-105 text-black' : 'text-gray-500 hover:text-black'
        }`
      }
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{name}</span>
    </NavLink>
  );
};

export default SidebarSubItem;