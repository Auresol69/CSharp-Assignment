import { useNavigate } from 'react-router-dom';
import FriendCard from '../../components/Friends/FriendCard';
import { useTheme } from '../../context/ThemeContext';

const Friends = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const GridHeader = ({ title, route }: { title: string, route: string }) => (
    <div className="flex justify-between items-center mb-4 px-2">
      <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
      <button 
        onClick={() => navigate(route)}
        className="text-blue-600 text-sm font-medium hover:underline p-1"
      >
        Xem tất cả
      </button>
    </div>
  );

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-10 transition-colors duration-300
      ${isDark ? 'text-white' : 'text-gray-900'}`}>
      
      {/* 1. Lời mời kết bạn */}
      <section>
        <GridHeader title="Lời mời kết bạn" route="/friends/requests" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <FriendCard name="Nguyễn Văn A" avatar="https://i.pravatar.cc/150?u=1" type="request" />
          <FriendCard name="Trần Thị B" avatar="https://i.pravatar.cc/150?u=2" type="request" />
        </div>
      </section>

      {/* 2. Bạn bè */}
      <section>
        <GridHeader title="Bạn bè" route="/friends/list" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <FriendCard name="Lê Văn C" avatar="https://i.pravatar.cc/150?u=3" type="friend" />
        </div>
      </section>

      {/* 3. Người bạn có thể biết */}
      <section>
        <GridHeader title="Những người bạn có thể biết" route="/friends/suggest" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <FriendCard name="Phạm Minh D" avatar="https://i.pravatar.cc/150?u=4" type="suggest" mutualFriends={5} />
          <FriendCard name="Hoàng An E" avatar="https://i.pravatar.cc/150?u=5" type="suggest" mutualFriends={12} />
        </div>
      </section>
    </div>
  );
};

export default Friends;