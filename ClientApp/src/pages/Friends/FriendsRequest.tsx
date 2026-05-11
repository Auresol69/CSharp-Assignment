import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import FriendCard from '../../components/Friends/FriendCard';
import { getFriendRequests } from '../../services/api/friendsApi';
import type { IFriend } from '../../types/Friends';
import { useTheme } from '../../context/ThemeContext';

const FriendRequests = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [requests, setRequests] = useState<IFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      const res = await getFriendRequests();
      setRequests(res.data ?? []);
    } catch (e) {
      console.error('Load friend requests error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return (
    <div className={`max-w-[calc(100%-10rem)] p-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/friends')}
          className={`p-2 rounded-full transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          aria-label="Quay lại danh sách bạn bè"
          title="Quay lại danh sách bạn bè"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Lời mời kết bạn</h1>
        {!loading && (
          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            ({requests.length})
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center pt-20 text-gray-500 opacity-60">
          <p>Đang tải...</p>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          {requests.map((f) => (
            <FriendCard
              key={f.userId ?? f.id}
              id={f.userId ?? f.id}
              name={f.name}
              avatar={f.avatar}
              type="request"
              onAction={loadRequests}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 opacity-60">
          <p>Bạn không có lời mời kết bạn nào mới.</p>
        </div>
      )}
    </div>
  );
};

export default FriendRequests;