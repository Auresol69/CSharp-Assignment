import { Plus } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { createStory } from '../../services/api/storyApi';
import { type UserStory } from '../../hooks/useStories'; //

interface StoryBarProps {
  userStories: UserStory[];
  loading?: boolean;
}

const StoryBar = ({ userStories, loading = false }: StoryBarProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('File', file);
      try {
        await createStory(formData);
        window.location.reload(); // Tải lại để hook fetch lại dữ liệu mới
      } catch (error) {
        console.error("Lỗi upload:", error);
      }
    }
  };

  return (
    <div className={`flex space-x-3 p-3 sm:p-4 max-w-full w-full rounded-2xl overflow-x-auto no-scrollbar
      ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
      
      {/* Nút Tạo tin */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
      <div 
        className={`relative shrink-0 w-24 h-40 sm:w-28 sm:h-48 rounded-xl overflow-hidden cursor-pointer border
          ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover" alt="me" />
        <div className="absolute inset-0 bg-black/20" />
        <div className={`absolute bottom-0 left-0 right-0 pt-5 pb-2 text-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 p-1 rounded-full border-4 border-inherit">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold">Tạo tin</span>
        </div>
      </div>

      {loading ? (
        // Skeleton hiển thị khi hook đang loading
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`relative shrink-0 w-24 h-40 sm:w-28 sm:h-48 rounded-xl animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        ))
      ) : (
        userStories.map((user) => (
          <div
            key={user.userId}
            className="relative shrink-0 w-24 h-40 sm:w-28 sm:h-48 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => navigate(`/Home/stories/${user.userId}/${user.stories[0].id}`)}
          >
            <img src={user.stories[0].url} className="w-full h-full object-cover group-hover:scale-105 transition" alt="story" />
            <div className="absolute top-2 left-2 p-0.5 bg-blue-500 rounded-full border-2 border-white">
              <img src={user.userAvatar || '/default-avatar.png'} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" alt="avatar" />
            </div>
            <span className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-bold truncate">{user.userName}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default StoryBar;