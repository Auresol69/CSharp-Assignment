import { MOCK_POSTS } from '../services/MockedData/mockPost';
import PostCard from '../components/Post/PostCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import FriendsGrid from '../components/Profile/FriendsGrid';

const Profile = () => {
  // Giả lập lấy bài viết của riêng user này
  const userPosts = MOCK_POSTS.slice(0, 3); 

  return (
    <div className="flex flex-col max-w-[calc(100%-10rem)] mx-auto min-h-screen bg-gray-100 pb-10 item-center justify-center">
      {/* 1. Phần đầu trang cá nhân */}
      <ProfileHeader />

      {/* 2. Phần nội dung chính */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 md:grid-cols-6 gap-6">
        
        {/* CỘT TRÁI: Thông tin & Bạn bè */}
        <div className="md:col-span-7 space-y-6">
          <ProfileSidebar />
          <FriendsGrid />
        </div>

        {/* CỘT PHẢI: Danh sách bài viết */}
        <div className="md:col-span-7">
          <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
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