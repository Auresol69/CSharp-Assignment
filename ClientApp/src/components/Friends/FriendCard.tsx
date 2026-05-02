import { UserPlus, UserCheck } from 'lucide-react';

interface FriendCardProps {
  name: string;
  avatar: string;
  type: 'friend' | 'request' | 'suggest';
  mutualFriends?: number;
}

const FriendCard = ({ name, avatar, type, mutualFriends }: FriendCardProps) => (
  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all active:scale-[0.98]">
    <div className="relative mb-3">
      <img 
        src={avatar} 
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-500 transition-colors cursor-pointer" 
        alt={name} 
      />
    </div>
    
    <h3 className="font-bold text-xs sm:text-sm text-gray-800 truncate w-full hover:underline cursor-pointer px-1">
      {name}
    </h3>
    
    {mutualFriends !== undefined && (
      <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 mb-3">{mutualFriends} bạn chung</p>
    )}
    
    {/* Nút: Co dãn linh hoạt tùy theo thiết bị */}
    <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto pt-2">
      {type === 'suggest' && (
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-all">
          <UserPlus size={14} /> Thêm
        </button>
      )}
      {type === 'request' && (
        <div className="flex flex-col sm:flex-row gap-1.5 w-full">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-blue-700 transition-all">Xác nhận</button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-gray-200 transition-all">Xóa</button>
        </div>
      )}
      {type === 'friend' && (
        <button className="w-full border border-gray-200 text-gray-700 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50 transition-all">
          <UserCheck size={14} /> Bạn bè
        </button>
      )}
    </div>
  </div>
);

export default FriendCard;