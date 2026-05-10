import { MapPin, Calendar } from 'lucide-react';
import type { IProfileResponseDto } from '../../types/Profile';

interface Props {
  profile?: IProfileResponseDto | null;
}

const ProfileSidebar = ({ profile }: Props) => {
  const bio = profile?.bio ?? '"Học code tại SGU cực vui 🚀"';
  const location = profile?.diaChi ?? 'TP. Hồ Chí Minh';
  const joined = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'tháng 3, 2026';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg sm:text-xl font-black text-gray-900">Gioi thieu</h2>
      <p className="text-center italic text-gray-600 text-sm sm:text-base px-2">
        {bio}
      </p>
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-3 text-gray-700">
          <div className="p-2 bg-gray-50 rounded-lg">
            <MapPin size={18} className="text-gray-400" />
          </div>
          <span className="text-sm sm:text-base">Đến từ <strong className="text-gray-900">{location}</strong></span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Calendar size={18} className="text-gray-400" />
          </div>
          <span className="text-sm sm:text-base">Tham gia vào {joined}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
