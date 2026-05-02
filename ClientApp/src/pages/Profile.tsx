import { useEffect, useState } from 'react';
import { MOCK_POSTS } from '../services/MockedData/mockPost';
import PostCard from '../components/Post/PostCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import FriendsGrid from '../components/Profile/FriendsGrid';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export interface ProfileData {
  id: string;
  tenTaiKhoan: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  ngaySinh?: string | null;
  gioiTinh?: string | null;
  diaChi?: string | null;
  createdAt: string;
  soLuongFollower: number;
  soLuongFollowing: number;
  soLuongPost: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

const Profile = () => {
  const userPosts = MOCK_POSTS.slice(0, 3);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get<ProfileData>('/profile/me');
        setProfile(response.data);
      } catch {
        setError('Khong tai duoc profile tu backend.');
      }
    };

    loadProfile();
  }, []);

  return (
    <div className={`w-full min-h-screen transition-colors duration-300
      ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <ProfileHeader profile={profile} onProfileUpdated={setProfile} />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 self-start">
        {error && (
          <div className="lg:col-span-12 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1 md:sticky md:top-20 h-fit">
          <ProfileSidebar profile={profile} />
          <FriendsGrid />
        </div>

        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-bold">Bai viet cua ban</h2>
            <p className="mt-1 text-xs text-gray-500">Backend hien chua co API lay danh sach bai viet, nen khu vuc nay van dung du lieu mau.</p>
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
