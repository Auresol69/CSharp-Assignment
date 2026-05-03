import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FriendCard from '../../components/Friends/FriendCard';
import { getFollowing } from '../../services/profileApi';
import type { IProfileResponseDto } from '../../types/Profile';

const PeopleYouMayKnow = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<IProfileResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        // Get current user ID from localStorage
        const auth = localStorage.getItem('auth');
        if (auth) {
          const parsed = JSON.parse(auth);
          const data = await getFollowing(parsed.user?.id || '', 0, 100);
          // Show first 10 as suggestions
          setSuggestions(data.slice(0, 10));
        }
      } finally {
        setLoading(false);
      }
    };

    void loadSuggestions();
  }, []);

  return (
    <div className="max-w-[calc(100%-10rem)] p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/friends')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Những người bạn có thể biết</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center pt-20 text-gray-500 opacity-60">
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          {suggestions.length > 0 ? (
            suggestions.map((person) => (
              <FriendCard 
                key={person.id} 
                name={person.tenTaiKhoan} 
                avatar={person.avatarUrl || ''} 
                type="suggest" 
              />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 text-gray-500">
              <p>Không có gợi ý nào lúc này.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeopleYouMayKnow;