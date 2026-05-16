import type { IProfileResponseDto } from '../../types/Profile';

interface Props {
  friends?: IProfileResponseDto[];
  title?: string;
  subtitle?: string;
  onViewAll?: () => void;
}

const FriendsGrid = ({ friends = [], title = 'Bạn bè', subtitle, onViewAll }: Props) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-500">{subtitle ?? `${friends.length} người bạn`}</p>
        </div>
        <button onClick={onViewAll} className="text-blue-600 hover:underline text-xs sm:text-sm font-bold">Xem tất cả</button>
      </div>
      
      {/* Grid: 3 cột trên mobile, 5 cột trên tablet/desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2 sm:gap-3">
        {friends.length > 0 ? (
          friends.map(friend => (
            <div key={friend.id} className="flex flex-col items-center group cursor-pointer">
              <div className="w-full aspect-square bg-gray-100 rounded-xl mb-1.5 overflow-hidden border border-gray-100">
                {friend.avatarUrl?.trim() ? (
                  <img src={friend.avatarUrl} alt={friend.tenTaiKhoan} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full group-hover:scale-110 transition-transform duration-300 bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-400 select-none">
                      {friend.tenTaiKhoan?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] sm:text-[13px] font-bold text-gray-800 truncate w-full text-center group-hover:text-blue-600 transition-colors">
                {friend.tenTaiKhoan}
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-3 sm:col-span-4 md:col-span-3 py-6 text-center text-sm text-gray-400">
            Chưa có người theo dõi
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsGrid;