import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FriendCard from '../../components/Friends/FriendCard';
import { MOCK_SUGGESTIONS } from '../../services/MockedData/mockSuggestions';

const PeopleYouMayKnow = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[calc(100%-10rem)] p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/friends')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Những người bạn có thể biết</h1>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
        {MOCK_SUGGESTIONS.map((person) => (
          <FriendCard 
            key={person.id} 
            {...person} 
            type="suggest" 
            mutualFriends={person.mutualFriends} 
          />
        ))}
      </div>
    </div>
  );
};

export default PeopleYouMayKnow;