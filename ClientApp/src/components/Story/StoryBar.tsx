import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import type { UserStory } from '../../hooks/useStories';

interface StoryBarProps {
  userStories: UserStory[];
  loading?: boolean;
}

const StoryBar = ({ userStories, loading = false }: StoryBarProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex space-x-3 p-3 sm:p-4 max-w-full w-full rounded-2xl overflow-x-auto no-scrollbar transition-colors
      ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
      
      {/* Nút Tạo tin */}
      <div className={`relative shrink-0 w-24 h-40 sm:w-28 sm:h-48 rounded-xl overflow-hidden cursor-pointer group border
        ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover group-hover:scale-105 transition" alt="me" />
        <div className="absolute inset-0 bg-black/20" />
        <div className={`absolute bottom-0 left-0 right-0 pt-5 pb-2 text-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 p-1 rounded-full border-4 border-inherit">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold">Tạo tin</span>
        </div>
      </div>

      {/* Skeleton loading */}
      {loading && Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`relative shrink-0 w-24 h-40 sm:w-28 sm:h-48 rounded-xl animate-pulse
          ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      ))}

      {/* Stories từ API */}
      {!loading && userStories.map((user) => (
        <div
          key={user.userId}
          className="relative shrink-0 w-24 h-40 sm:w-28 sm:h-48 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => navigate(`/Home/stories/${user.userId}/${user.stories[0].id}`)}
        >
          <img src={user.stories[0].url} className="w-full h-full object-cover group-hover:scale-105 transition" alt="story" />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/20" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 p-0.5 bg-blue-500 rounded-full border-2 border-white">
            {user.userAvatar?.trim() ? (
              <img src={user.userAvatar} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white" alt="avatar" />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 border border-white" />
            )}
          </div>
          <span className="absolute bottom-2 left-2 right-2 text-white text-[10px] sm:text-[11px] font-bold truncate">
            {user.userName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoryBar;