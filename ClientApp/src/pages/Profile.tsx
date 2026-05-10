import { useEffect, useState } from 'react';
import PostCard from '../components/Post/PostCard';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileSidebar from '../components/Profile/ProfileSidebar';
import FriendsGrid from '../components/Profile/FriendsGrid';
import { useTheme } from '../context/ThemeContext';
import type { IProfileResponseDto } from '../types/Profile';
import type { IPost } from '../types/Post';
import { getMyProfile, getFollowers } from '../services/profileApi';
import { getFeed } from '../services/postsApi';

const Profile = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState<IProfileResponseDto | null>(null);
  const [followers, setFollowers] = useState<IProfileResponseDto[]>([]);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentProfile = await getMyProfile();
        setProfile(currentProfile);
        const followerList = await getFollowers(currentProfile.id, 1, 10);
        setFollowers(followerList);

        const feed = await getFeed(null, 30);
        setUserPosts(feed.posts.filter(post => post.authorId === currentProfile.id).slice(0, 3));
      } catch (error) {
        void error;
      }
    };

    void loadProfile();
  }, []);

  return (
    <div className={`w-full min-h-screen transition-colors duration-300
      ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      <ProfileHeader profile={profile} />

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 self-start">
        {error && (
          <div className="lg:col-span-12 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1 md:sticky md:top-20 h-fit">
          <ProfileSidebar profile={profile} />
          <FriendsGrid friends={followers} subtitle={profile ? `${profile.soLuongFollower} người theo dõi` : undefined} />
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
