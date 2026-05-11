import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import FriendCard from '../../components/Friends/FriendCard';
import { getFriends } from '../../services/api/friendsApi';
import type { IFriend } from '../../types/Friends';
import { useTheme } from '../../context/ThemeContext';

const FriendsList = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    try {
      const res = await getFriends();
      setFriends(res.data ?? []);
    } catch (e) {
      console.error('Load friends error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`max-w-[calc(100%-10rem)] p-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/friends')}
          className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          aria-label="Quay lại danh sách bạn bè"
          title="Quay lại danh sách bạn bè"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Tất cả bạn bè</h1>
        {!loading && (
          <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            ({friends.length} người bạn)
          </span>
        )}
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm bạn bè..."
          className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition
            ${isDark
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center pt-20 text-gray-500 opacity-60">
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendCard
                key={friend.userId ?? friend.id}
                id={friend.userId ?? friend.id}
                name={friend.name}
                avatar={friend.avatar}
                type="friend"
                onAction={loadFriends}
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 text-gray-500 opacity-60">
              <p>Không tìm thấy bạn bè nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsList;