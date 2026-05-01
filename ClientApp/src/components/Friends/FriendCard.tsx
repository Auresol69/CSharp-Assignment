import { UserPlus, UserCheck } from 'lucide-react';

interface FriendCardProps {
  name: string;
  avatar: string;
  type: 'friend' | 'request' | 'suggest';
  mutualFriends?: number;
}

const FriendCard = ({ name, avatar, type, mutualFriends }: FriendCardProps) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-shadow">
    <img src={avatar} className="w-20 h-20 rounded-full mb-3 object-cover border-2 border-blue-100 cursor-pointer" alt={name} />
    <h3 className="font-bold text-sm text-gray-800 truncate w-full hover:underline cursor-pointer">{name}</h3>
    {mutualFriends !== undefined && (
      <p className="text-[11px] text-gray-500 mb-3">{mutualFriends} bạn chung</p>
    )}
    
    <div className="flex gap-10 w-full mt-4">
      {type === 'suggest' && (
        <button className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-700">
          <UserPlus size={14} /> Thêm
        </button>
      )}
      {type === 'request' && (
        <>
          <button className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">Xác nhận</button>
          <button className="flex-1 text-gray-700 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 border border-gray-200">Xóa</button>
        </>
      )}
      {type === 'friend' && (
        <button className="flex-1 border border-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-gray-50">
          <UserCheck size={14} /> Bạn bè
        </button>
      )}
    </div>
  </div>
);

export default FriendCard;