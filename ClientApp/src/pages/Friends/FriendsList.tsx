import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FriendCard from '../../components/Friends/FriendCard';
import { getFollowing } from '../../services/profileApi';
import type { IProfileResponseDto } from '../../types/Profile';

const FriendsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<IProfileResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        // Get current user ID from localStorage
        const auth = localStorage.getItem('auth');
        if (auth) {
          const parsed = JSON.parse(auth);
          const data = await getFollowing(parsed.user?.id || '', 0, 100);
          setFriends(data);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadFriends();
  }, []);

  const filteredFriends = friends.filter(f => 
    f.tenTaiKhoan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[calc(100%-10rem)] p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/friends')} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Quay lại danh sách bạn bè" title="Quay lại danh sách bạn bè">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Tất cả bạn bè</h1>
        <span className="text-gray-500 font-medium">({friends.length} người bạn)</span>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm kiếm bạn bè..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                key={friend.id} 
                name={friend.tenTaiKhoan} 
                avatar={friend.avatarUrl || ''} 
                type="friend" 
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 text-gray-500">
              <p>Không tìm thấy bạn bè nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsList;