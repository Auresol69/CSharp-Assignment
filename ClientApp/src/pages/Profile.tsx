import { MapPin, Calendar, Edit3, Camera } from 'lucide-react';
import { MOCK_POSTS } from '../services/MockedData/mockPost';
import PostCard from '../components/Post/PostCard';

const Profile = () => {
  // Giả lập lấy bài viết của riêng user này
  const userPosts = MOCK_POSTS.slice(0, 3); 

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100 pb-10">
      {/* 1. COVER & AVATAR SECTION */}
      <div className="relative bg-white shadow-sm">
        {/* Cover Photo */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
          <button className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg flex items-center space-x-2 hover:bg-black/70">
            <Camera size={18} />
            <span className="text-sm">Chỉnh sửa ảnh bìa</span>
          </button>
        </div>

        {/* Avatar & Info Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-5 items-center justify-between">
            <div className="relative inline-block">
              <img 
                src="https://via.placeholder.com/150" 
                alt="Avatar" 
                className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white object-cover shadow-md"
              />
              <button className="absolute bottom-2 right-2 bg-gray-200 p-1.5 rounded-full hover:bg-gray-300">
                <Camera size={18} />
              </button>
            </div>

            <div className="mt-4 md:mt-0 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Tên của ông nè</h1>
              <p className="text-gray-500 font-medium">500 bạn bè • 20 bài viết</p>
            </div>

            <div className="mt-4 md:mt-0">
              <button className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                <Edit3 size={18} />
                <span>Chỉnh sửa trang cá nhân</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INFO */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
            <h2 className="text-xl font-bold">Giới thiệu</h2>
            <p className="text-center italic text-gray-600">"Học code tại SGU cực vui 🚀"</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <MapPin size={20} className="text-gray-400" />
                <span>Đến từ <strong>TP. Hồ Chí Minh</strong></span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar size={20} className="text-gray-400" />
                <span>Tham gia vào tháng 3, 2026</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bạn bè</h2>
              <button className="text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Dummy friends list */}
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-full aspect-square bg-gray-200 rounded-lg mb-1"></div>
                  <span className="text-xs font-medium text-gray-700">Bạn thứ {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: POSTS */}
        <div className="md:col-span-7">
          <div className="mb-4 bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Bài viết của bạn</h2>
            {/* Nếu có Component đăng bài nhanh (CreatePost) thì bỏ vào đây */}
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