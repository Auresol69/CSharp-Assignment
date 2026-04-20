// src/components/Story/StoryBar.tsx
import { Plus } from 'lucide-react';
import { MOCK_STORIES } from '../../services/MockedData/mockStories';

interface StoryBarProps {
  onStoryClick: (index: number) => void; // Khai báo props nhận vào từ Home.tsx
}

const StoryBar = ({ onStoryClick }: StoryBarProps) => {
  return (
    <div className="flex space-x-2 p-4 max-w-full w-full bg-white rounded-xl shadow-sm overflow-x-auto no-scrollbar mb-4">
      {/* Nút Tạo tin */}
      <div className="relative flex-shrink-0 w-28 h-48 rounded-xl overflow-hidden cursor-pointer group border border-gray-200">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-full h-full object-cover group-hover:scale-105 transition" alt="me" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 bg-white pt-5 pb-2 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 p-1 rounded-full border-4 border-white">
            <Plus size={20} className="text-white" />
          </div>
          <span className="text-xs font-bold">Tạo tin</span>
        </div>
      </div>

      {/* Danh sách Stories của bạn bè */}
      {MOCK_STORIES.map((user, index) => (
        <div key={user.userId} className="relative flex-shrink-0 w-28 h-48 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => onStoryClick(index)}> {/* Gọi hàm onStoryClick với index của story được click */}
          <img src={user.stories[0].url} className="w-full h-full object-cover group-hover:scale-105 transition" alt="story" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
          <div className="absolute top-3 left-3 p-0.5 bg-blue-500 rounded-full border-2 border-white">
            <img src={user.userAvatar} className="w-8 h-8 rounded-full border-2 border-white" alt="avatar" />
          </div>
          <span className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-bold truncate">
            {user.userName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoryBar;