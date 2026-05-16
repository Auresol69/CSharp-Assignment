import useFeed from '../hooks/useFeed';
import useStories from '../hooks/useStories';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostCard from '../components/Post/PostCard';
import PostSkeleton from '../components/Post/PostSkeleton';
import PostCreated from '../components/Post/PostCreated';
import TrendingSidebar from '../components/Trending/TrendingSidebar';
import StoryViewer from '../components/Story/StoryViewer';
import StoryBar from '../components/Story/StoryBar';
import PostDetailModal from '../components/Post/PostDetailModal';
import { useTheme } from '../context/ThemeContext';
import { Loader2 } from 'lucide-react';

function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const { postId, userId, storyId } = useParams<{
    postId?: string;
    userId?: string;
    storyId?: string;
  }>();

  const [filterTag, setFilterTag] = useState<string | null>(null);
  const { posts, loading: isLoading, refresh, hasMore, load } = useFeed(true, 10);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { userStories, loading: storiesLoading } = useStories(20);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          load(false);
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, isLoading, load]);

  useEffect(() => {
    const handleReload = () => {
      setFilterTag(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      refresh();
    };

    window.addEventListener('reload-dashboard', handleReload);
    return () => {
      window.removeEventListener('reload-dashboard', handleReload);
    };
  }, [refresh]);

  // Xử lý sau khi tạo bài viết mới (map dữ liệu từ phản hồi API)
  const handleNewPost = (newPostData: any) => {
    void newPostData;
    refresh();
  };

  const handlePostDeleted = (deletedPostId: string) => {
    void deletedPostId;
    refresh();
  };

  const filteredPosts = filterTag
    ? posts.filter((p) => p.content.includes(filterTag) || p.sharedPost?.content.includes(filterTag))
    : posts;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-10 px-4 sm:px-6 md:px-8 lg:px-12 py-6">
        <main className="flex-1 w-full max-w-170 mx-auto flex flex-col gap-6">
          <PostCreated onPostCreated={handleNewPost} />

          <section className={`border transition-all duration-300 rounded-4xl p-2 overflow-hidden shadow-sm
            ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-200'}`}>
            <StoryBar userStories={userStories} loading={storiesLoading} />
          </section>

          {filterTag && !isLoading && (
            <div className={`p-4 border rounded-2xl flex justify-between items-center backdrop-blur-sm
              ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
              <span className="text-sm font-medium">Kết quả cho: <strong>#{filterTag}</strong></span>
              <button onClick={() => setFilterTag(null)} className="text-xs font-bold hover:underline">XEM TẤT CẢ</button>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {posts.length === 0 && isLoading ? (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
              </div>
            ) : (
              <>
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onTagClick={setFilterTag} onDeleted={handlePostDeleted} />
                ))}
                
                {/* Sentinel element for infinite scroll */}
                <div ref={sentinelRef} className="h-10" />
                
                {/* Loading indicator for pagination */}
                {!isLoading && hasMore && filteredPosts.length > 0 && (
                  <div className={`py-6 flex justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <div className="text-xs font-medium">Cuộn xuống để xem thêm...</div>
                  </div>
                )}
                
                {isLoading && posts.length > 0 && (
                  <div className={`py-6 flex justify-center items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-medium">Đang tải thêm bài viết...</span>
                  </div>
                )}
                
                {!hasMore && filteredPosts.length > 0 && (
                  <div className={`py-6 text-center text-xs font-medium ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    Đã hết bài viết
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <aside className="hidden lg:block w-[320px] sticky top-6 self-start">
          <div className={`border transition-all duration-300 rounded-[2.5rem] p-6 shadow-xl
            ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-100'}`}>
            <TrendingSidebar setFilterTag={setFilterTag} />
          </div>
          <div className={`mt-6 px-4 text-[10px] uppercase tracking-[0.2em] font-bold ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
            © 2026 InteractHub - SGU Project
          </div>
        </aside>

        {userId && storyId && userStories.length > 0 && (
          <StoryViewer
            userStories={userStories}
            initialUserIndex={Math.max(0, userStories.findIndex((u) => u.userId === userId))}
            initialStoryId={storyId}
            onClose={() => navigate('/Home')}
          />
        )}

        {postId && (
          <PostDetailModal
            postId={postId}
            onClose={() => navigate('/Home')}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
