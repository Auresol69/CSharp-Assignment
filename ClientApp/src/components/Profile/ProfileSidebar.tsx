import { MapPin, Calendar } from 'lucide-react';

const ProfileSidebar = () => {
  return (
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
  );
};

export default ProfileSidebar;