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

function Home() {
  const { postId, userId, storyId } = useParams<{ 
    postId?: string; 
    userId?: string; 
    storyId?: string 
  }>();
  
  const navigate = useNavigate();
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  
  const filteredPosts = filterTag 
    ? MOCK_POSTS.filter(p => p.content.includes(filterTag) || p.sharedPost?.content.includes(filterTag))
    : MOCK_POSTS;

  return (
    <div className='flex flex-row w-full min-h-screen space-x-4 items-start justify-center gap-8 px-12 py-4'>
      <div className='flex flex-col flex-1 rounded-lg p-4 bg-gray-50 min-w-0 max-w-3/5'>
        <PostCreated />
        <StoryBar />

        {filterTag && !isLoading && (
          <div className="mb-4 p-2 bg-blue-50 text-black rounded-lg flex justify-between items-center">
            <span>Các bài đăng có: <strong>{filterTag}</strong></span>
            <button onClick={() => setFilterTag(null)} className="text-xs underline">Xem tất cả</button>
          </div>
        )}

        <div className="w-full mx-auto">
          {isLoading ? (
            <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onTagClick={setFilterTag} />
            ))
          )}
        </div>
      </div>

      <aside className="lg:block w-1/4 sticky top-4 right-3">
        <TrendingSidebar setFilterTag={setFilterTag} />
      </aside>

      {/* Hiển thị Story khi URL khớp /Home/stories/:userId/:storyId */}
      {userId && storyId && (
        <StoryViewer 
          userStories={MOCK_STORIES} 
          initialUserIndex={MOCK_STORIES.findIndex(u => u.userId === userId)}
          initialStoryId={storyId}
          onClose={() => navigate('/Home')} 
        />
      )}
      
      {/* Hiển thị Bài viết khi URL khớp /Home/:postId */}
      {postId && (
        <PostDetailModal 
          postId={postId} 
          onClose={() => navigate('/Home')} 
        />
      )}
    </div>
  );
}

export default Home;