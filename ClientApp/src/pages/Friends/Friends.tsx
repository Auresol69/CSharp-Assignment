import { useNavigate } from 'react-router-dom';
import FriendCard from '../../components/Friends/FriendCard';
import { useTheme } from '../../context/ThemeContext';
import { useEffect, useState, useCallback } from 'react';
import {
  getFriends,
  getFriendRequests,
  getSuggestions,
} from '../../services/api/friendsApi';
import type { IFriend } from '../../types/Friends';

const Friends = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [friendsList, setFriendsList]     = useState<IFriend[]>([]);
  const [requestsList, setRequestsList]   = useState<IFriend[]>([]);
  const [suggestList, setSuggestList]     = useState<IFriend[]>([]);
  const [loading, setLoading]             = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, rRes, sRes] = await Promise.all([
        getFriends(),
        getFriendRequests(),
        getSuggestions(),
      ]);
      setFriendsList(fRes.data ?? []);
      setRequestsList(rRes.data ?? []);
      setSuggestList(sRes.data ?? []);
    } catch (e) {
      console.error('Load friends overview error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const GridHeader = ({ title, route, count }: { title: string; route: string; count?: number }) => (
    <div className="flex justify-between items-center mb-4 px-2">
      <div className="flex items-center gap-2">
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
        {count !== undefined && !loading && (
          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
            {count}
          </span>
        )}
      </div>
      <button
        onClick={() => navigate(route)}
        className="text-blue-600 text-sm font-medium hover:underline p-1"
      >
        Xem tất cả
      </button>
    </div>
  );

  // Skeleton loading cards
  const SkeletonCards = ({ n }: { n: number }) => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`p-4 rounded-2xl border animate-pulse ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-3 w-3/4 rounded mx-auto mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-8 rounded-xl mt-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      ))}
    </div>
  );

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-10 transition-colors duration-300
      ${isDark ? 'text-white' : 'text-gray-900'}`}>

      {/* 1. Lời mời kết bạn */}
      <section>
        <GridHeader title="Lời mời kết bạn" route="/friends/requests" count={requestsList.length} />
        {loading ? (
          <SkeletonCards n={2} />
        ) : requestsList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {requestsList.slice(0, 5).map((f) => (
              <FriendCard
                key={f.userId ?? f.id}
                id={f.userId ?? f.id}
                name={f.name}
                avatar={f.avatar}
                type="request"
                onAction={loadAll}
              />
            ))}
          </div>
        ) : (
          <p className={`px-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Không có lời mời kết bạn nào.
          </p>
        )}
      </section>

      {/* 2. Bạn bè */}
      <section>
        <GridHeader title="Bạn bè" route="/friends/list" count={friendsList.length} />
        {loading ? (
          <SkeletonCards n={4} />
        ) : friendsList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {friendsList.slice(0, 5).map((f) => (
              <FriendCard
                key={f.userId ?? f.id}
                id={f.userId ?? f.id}
                name={f.name}
                avatar={f.avatar}
                type="friend"
                onAction={loadAll}
              />
            ))}
          </div>
        ) : (
          <p className={`px-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Bạn chưa có bạn bè nào.
          </p>
        )}
      </section>

      {/* 3. Người bạn có thể biết */}
      <section>
        <GridHeader title="Những người bạn có thể biết" route="/friends/suggest" count={suggestList.length} />
        {loading ? (
          <SkeletonCards n={5} />
        ) : suggestList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {suggestList.slice(0, 5).map((f) => (
              <FriendCard
                key={f.userId ?? f.id}
                id={f.userId ?? f.id}
                name={f.name}
                avatar={f.avatar}
                type="suggest"
                mutualFriends={f.mutualFriends}
                onAction={loadAll}
              />
            ))}
          </div>
        ) : (
          <p className={`px-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Không có gợi ý nào lúc này.
          </p>
        )}
      </section>
    </div>
  );
};

export default Friends;