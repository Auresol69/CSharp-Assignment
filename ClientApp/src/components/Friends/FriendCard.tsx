import { useState } from 'react';
import { UserCheck, UserPlus, UserX, UserMinus, Loader2 } from 'lucide-react';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
} from '../../services/api/friendsApi';

interface FriendCardProps {
  id?: string;
  name: string;
  avatar: string;
  type: 'friend' | 'request' | 'suggest';
  mutualFriends?: number;
  onAction?: () => void | Promise<void>;
}

const FriendCard = ({ id, name, avatar, type, mutualFriends, onAction }: FriendCardProps) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const run = async (apiCall: () => Promise<unknown>) => {
    if (busy || !id) return;
    setBusy(true);
    try {
      await apiCall();
      setDone(true);
      onAction?.();
    } catch (e) {
      console.error('FriendCard action error:', e);
    } finally {
      setBusy(false);
    }
  };

  const handleAccept  = () => run(() => acceptFriendRequest(id!));
  const handleReject  = () => run(() => rejectFriendRequest(id!));
  const handleAdd     = () => run(() => sendFriendRequest(id!));
  const handleUnfriend = () => run(() => unfriend(id!));

  if (done) return null; // ẩn card sau khi action thành công

  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all active:scale-[0.98]">
      <div className="relative mb-3">
        {avatar.trim() ? (
          <img
            src={avatar}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-500 transition-colors cursor-pointer"
            alt={name}
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-2 border-blue-100" />
        )}
      </div>

      <h3 className="font-bold text-xs sm:text-sm text-gray-800 truncate w-full hover:underline cursor-pointer px-1">
        {name}
      </h3>

      {mutualFriends !== undefined && (
        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 mb-3">{mutualFriends} bạn chung</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto pt-2">
        {type === 'suggest' && (
          <button
            onClick={handleAdd}
            disabled={busy}
            className="w-full bg-blue-600 text-white py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-all disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Thêm bạn
          </button>
        )}

        {type === 'request' && (
          <div className="flex flex-col sm:flex-row gap-1.5 w-full">
            <button
              onClick={handleAccept}
              disabled={busy}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : null}
              Xác nhận
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-gray-200 transition-all disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
              Xóa
            </button>
          </div>
        )}

        {type === 'friend' && (
          <button
            onClick={handleUnfriend}
            disabled={busy}
            className="w-full border border-gray-200 text-gray-700 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-60"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
            {busy ? 'Đang xử lý...' : 'Bạn bè'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendCard;
