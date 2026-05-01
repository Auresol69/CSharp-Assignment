import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';

interface ISubItemProps {
  name: string;
  path: string;
  icon: LucideIcon;
}

const SidebarSubItem = ({ name, path, icon: Icon }: ISubItemProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const nextIsDark = !isDark;

    document.documentElement.classList.toggle('dark', nextIsDark);
    document.body.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };

  if (name === 'Dark Mode') {
    return (
      <button
        type="button"
        onClick={toggleDarkMode}
        className="flex items-center space-x-3 p-3 -ml-5 -mt-5 rounded-lg transition-all text-left text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 cursor-pointer"
      >
        <Icon size={18} />
        <span className="text-sm font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>
    );
  }

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg transition-all -ml-5 -mt-5
        ${isActive ? 'bg-gray-200 dark:bg-gray-700 font-bold scale-105 text-black dark:text-white' : 'text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white'}`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{name}</span>
    </NavLink>
  );
};

export default SidebarSubItem;
