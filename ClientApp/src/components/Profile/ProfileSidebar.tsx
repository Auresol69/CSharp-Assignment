import { MapPin, Calendar } from 'lucide-react';
import type { ProfileData } from '../../pages/Profile';

const ProfileSidebar = ({ profile }: { profile: ProfileData | null }) => {
  const joinedAt = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg sm:text-xl font-black text-gray-900">Gioi thieu</h2>
      <p className="text-center italic text-gray-600 text-sm sm:text-base px-2">
        "{profile?.bio || 'Chua co gioi thieu.'}"
      </p>
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-3 text-gray-700">
          <div className="p-2 bg-gray-50 rounded-lg">
            <MapPin size={18} className="text-gray-400" />
          </div>
          <span className="text-sm sm:text-base">Dia chi <strong className="text-gray-900">{profile?.diaChi || 'chua cap nhat'}</strong></span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Calendar size={18} className="text-gray-400" />
          </div>
          <span className="text-sm sm:text-base">{joinedAt ? `Tham gia ${joinedAt}` : 'Dang tai ngay tham gia'}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
