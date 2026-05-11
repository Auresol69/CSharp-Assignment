import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import FriendCard from '../../components/Friends/FriendCard';
import { getSuggestions } from '../../services/api/friendsApi';
import type { IFriend } from '../../types/Friends';
import { useTheme } from '../../context/ThemeContext';

const PeopleYouMayKnow = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [suggestions, setSuggestions] = useState<IFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await getSuggestions();
      setSuggestions(res.data ?? []);
    } catch (e) {
      console.error('Load suggestions error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

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
        <h1 className="text-2xl font-bold">Những người bạn có thể biết</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center pt-20 text-gray-500 opacity-60">
          <p>Đang tải...</p>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-4 gap-4">
          {suggestions.map((person) => (
            <FriendCard
              key={person.userId ?? person.id}
              id={person.userId ?? person.id}
              name={person.name}
              avatar={person.avatar}
              type="suggest"
              mutualFriends={person.mutualFriends}
              onAction={loadSuggestions}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-4 text-center py-20 text-gray-500 opacity-60">
          <p>Không có gợi ý nào lúc này.</p>
        </div>
      )}
    </div>
  );
};

export default PeopleYouMayKnow;