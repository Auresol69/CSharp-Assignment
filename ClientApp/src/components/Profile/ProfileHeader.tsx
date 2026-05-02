import { Camera, Edit3 } from 'lucide-react';
import { useState } from 'react';
import EditProfileModal from './EditProfileModal/EditProfileModal';

const ProfileHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userProfile = {
    bio: "Sinh viên Đại học Sài Gòn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SGU",
    coverImage: "https://picsum.photos/800/300",
    showEmail: true,
    showPhone: false,
    showWorkplace: true
  };

  return (
    <div className="relative bg-white shadow-sm border-b">
      {/* Cover Photo */}
      <div className="h-48 sm:h-64 md:h-80 bg-linear-to-r from-blue-400 to-indigo-500 relative">
        <button className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/50 text-white p-2 rounded-lg flex items-center space-x-2 hover:bg-black/70 transition-all active:scale-95">
          <Camera size={18} />
          <span className="hidden sm:inline text-sm">Chỉnh sửa ảnh bìa</span>
        </button>
      </div>

      {/* Avatar & Info Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 md:-mt-20 pb-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-5 items-center text-center md:text-left justify-between">
          <div className="relative inline-block">
            <img 
              src="https://via.placeholder.com/150" 
              alt="Avatar" 
              className="h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full border-4 border-white object-cover shadow-md"
            />
            <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-gray-200 p-1.5 sm:p-2 rounded-full hover:bg-gray-300 border-2 border-white shadow-sm">
              <Camera size={16} />
            </button>
          </div>

          <div className="mt-3 md:mt-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight">Tên của ông nè</h1>
            <p className="text-gray-500 text-sm sm:text-base font-medium">500 bạn bè • 20 bài viết</p>
          </div>

          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <button 
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gray-200 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition active:scale-95"
              onClick={() => setIsModalOpen(true)}
            >
              <Edit3 size={18} />
              <span className="text-sm">Chỉnh sửa trang cá nhân</span>
            </button>
          </div>
      
          {isModalOpen && (
            <EditProfileModal 
              initialData={userProfile} 
              onClose={() => setIsModalOpen(false)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;