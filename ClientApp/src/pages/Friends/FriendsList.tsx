import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FriendCard from '../../components/Friends/FriendCard';
import { MOCK_FRIENDS } from '../../services/MockedData/mockFriends'

const FriendsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = MOCK_FRIENDS.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[calc(100%-10rem)] ml-36 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/friends')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Tất cả bạn bè</h1>
        <span className="text-gray-500 font-medium">({MOCK_FRIENDS.length} người bạn)</span>
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

      <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
        {filteredFriends.map((friend) => (
          <FriendCard key={friend.id} {...friend} type="friend" />
        ))}
      </div>
    </div>
  );
};

export default FriendsList;