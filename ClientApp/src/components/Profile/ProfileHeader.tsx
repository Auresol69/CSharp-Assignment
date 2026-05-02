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
    <div className="relative bg-white shadow-sm">
      {/* Cover Photo */}
      <div className="h-64 md:h-80 bg-linear-to-r from-blue-400 to-indigo-500 relative">
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
            <button className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                    onClick={() => setIsModalOpen(true)}>
              <Edit3 size={18} />
              <span>Chỉnh sửa trang cá nhân</span>
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