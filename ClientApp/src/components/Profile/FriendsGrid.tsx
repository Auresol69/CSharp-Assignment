const FriendsGrid = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bạn bè</h2>
        <button className="text-blue-600 hover:underline text-sm">Xem tất cả</button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-200 rounded-lg mb-1"></div>
            <span className="text-[14px] font-medium text-gray-700">Bạn thứ {i}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsGrid;