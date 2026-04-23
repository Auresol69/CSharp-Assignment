import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FriendCard from '../../components/Friends/FriendCard';
import { MOCK_REQUESTS } from '../../services/MockedData/mockRequests';

const FriendRequests = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[calc(100%-10rem)] ml-36 p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/friends')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Lời mời kết bạn</h1>
      </div>

      {MOCK_REQUESTS.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          {MOCK_REQUESTS.map((req) => (
            <FriendCard key={req.id} {...req} type="request" />
          ))}
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