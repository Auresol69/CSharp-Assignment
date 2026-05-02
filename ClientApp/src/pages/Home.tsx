import { MOCK_POSTS } from '../services/MockedData/mockPost';
import { useEffect, useState } from 'react';
import PostCard from '../components/Post/PostCard';
import PostSkeleton from '../components/Post/PostSkeleton';
import PostCreated from '../components/Post/PostCreated';
import TrendingSidebar from '../components/Trending/TrendingSidebar';
import { MOCK_STORIES } from '../services/MockedData/mockStories';
import StoryViewer from '../components/Story/StoryViewer';
import StoryBar from '../components/Story/StoryBar';
import { useNavigate, useParams } from 'react-router-dom';
import PostDetailModal from '../components/Post/PostDetailModal';
import type { IPost } from '../types/Post';
import { useTheme } from '../context/ThemeContext';

function Home() {
  const { theme } = useTheme(); 
  const isDark = theme === 'dark';
  
  const { postId, userId, storyId } = useParams<{ 
    postId?: string; 
    userId?: string; 
    storyId?: string 
  }>();
  
  const navigate = useNavigate();
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<IPost[]>(MOCK_POSTS as IPost[]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    const handleReload = () => {
      setIsLoading(true);
      setFilterTag(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('reload-dashboard', handleReload);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('reload-dashboard', handleReload);
    };
  }, []);

  const handleNewPost = (newPostData: any) => {
    const newPost: IPost = {
      id: newPostData.id,
      authorId: newPostData.user.id || "me",
      authorName: newPostData.user.name,
      authorAvatar: newPostData.user.avatar,
      content: newPostData.content,
      mediaUrl: newPostData.image || undefined,
      createdAt: "Vừa xong",
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    setAllPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setAllPosts(prev => prev.filter(post => post.id !== deletedPostId));
  };
  
  const filteredPosts = filterTag 
    ? allPosts.filter(p => p.content.includes(filterTag) || p.sharedPost?.content.includes(filterTag))
    : allPosts;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* 
        Responsive layout: 
        - Mobile/Tablet: 1 cột chính (gap-6)
        - Desktop (lg): Hiện thêm sidebar (gap-10)
      */}
      <div className='max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-10 px-4 sm:px-6 md:px-8 lg:px-12 py-6'>
        
        <main className='flex-1 w-full max-w-170 mx-auto flex flex-col gap-6'>
          <PostCreated onPostCreated={handleNewPost} />
          
          <section className={`border transition-all duration-300 rounded-4xl p-2 overflow-hidden shadow-sm
            ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-200'}`}>
            <StoryBar />
          </section>

          {filterTag && !isLoading && (
            <div className={`p-4 border rounded-2xl flex justify-between items-center backdrop-blur-sm animate-in fade-in duration-300
              ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
              <span className="text-sm font-medium">Kết quả cho: <strong className={isDark ? 'text-blue-300' : 'text-blue-700'}>#{filterTag}</strong></span>
              <button onClick={() => setFilterTag(null)} className="text-xs font-bold hover:underline">XEM TẤT CẢ</button>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {isLoading ? (
              <div className="space-y-5">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onTagClick={setFilterTag} onDeleted={handlePostDeleted} />
              ))
            )}
          </div>
        </main>

        <aside className="hidden lg:block w-[320px] sticky top-6 self-start">
          <div className={`border transition-all duration-300 rounded-[2.5rem] p-6 shadow-xl
            ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-100'}`}>
            <TrendingSidebar setFilterTag={setFilterTag} />
          </div>
          
          <div className={`mt-6 px-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors
            ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
            © 2026 InteractHub — SGU Project
          </div>
        </aside>

        {userId && storyId && (
          <StoryViewer 
            userStories={MOCK_STORIES} 
            initialUserIndex={MOCK_STORIES.findIndex(u => u.userId === userId)}
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
