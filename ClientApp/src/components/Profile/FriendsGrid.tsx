const FriendsGrid = () => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">Bạn bè</h2>
          <p className="text-xs sm:text-sm text-gray-500">500 người bạn</p>
        </div>
        <button className="text-blue-600 hover:underline text-xs sm:text-sm font-bold">Xem tất cả</button>
      </div>
      
      {/* Grid: 3 cột trên mobile, 5 cột trên tablet/desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={i} className="flex flex-col items-center group cursor-pointer">
            <div className="w-full aspect-square bg-gray-100 rounded-xl mb-1.5 overflow-hidden border border-gray-100">
              <div className="w-full h-full group-hover:scale-110 transition-transform duration-300 bg-gray-200" />
            </div>
            <span className="text-[11px] sm:text-[13px] font-bold text-gray-800 truncate w-full text-center group-hover:text-blue-600 transition-colors">
              Bạn thứ {i}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsGrid;