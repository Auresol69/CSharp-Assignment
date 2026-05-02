import { MOCK_POSTS } from '../services/MockedData/mockPost';
import PostCard from '../components/Post/PostCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import FriendsGrid from '../components/Profile/FriendsGrid';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const userPosts = MOCK_POSTS.slice(0, 3); 
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`w-full min-h-screen transition-colors duration-300
      ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      <ProfileHeader />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 self-start">
        
        {/* CỘT TRÁI: Info & Friends - Xếp chồng trên mobile, chiếm 5/12 cột trên desktop */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1 md:sticky md:top-20 h-fit">
          <ProfileSidebar />
          <FriendsGrid />
        </div>

        {/* CỘT PHẢI: Posts - Hiện lên trước trên mobile, chiếm 7/12 cột trên desktop */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold">Bài viết của bạn</h2>
          </div>
          
          <div className="space-y-4">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;