import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FriendRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend API for friend requests not yet implemented
    // TODO: Wire to getFriendRequests() when endpoint is available
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="max-w-[calc(100%-10rem)] p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/friends')} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Quay lại danh sách bạn bè" title="Quay lại danh sách bạn bè">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Lời mời kết bạn</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center pt-20 text-gray-500 opacity-60">
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p>Bạn không có lời mời kết bạn nào mới.</p>
        </div>
      )}
    </div>
  );
};

export default FriendRequests;