import { MOCK_TRENDING } from '../../services/MockedData/mockTrending';

interface TrendingSidebarProps {
  setFilterTag: (tag: string) => void;
}

const TrendingSidebar = ({ setFilterTag }: TrendingSidebarProps) => {
  return (
    <div className='w-full lg:w-[280px] h-[calc(100vh-100px)] border border-gray-200 rounded-xl p-4 bg-white sticky top-20 self-start shadow-sm flex flex-col'>
      <h3 className="font-bold text-lg mb-4 border-b pb-2 text-gray-800">
        Xu hướng cho bạn
      </h3>

      {/* Vùng cuộn riêng cho danh sách hashtag */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
        {MOCK_TRENDING.map((item, index) => (
          <div 
            key={item.tag}
            onClick={() => setFilterTag(item.tag)}
            className="group flex flex-col p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Top {index + 1}
              </span>
            </div>
            <p className="text-black font-bold group-hover:underline mt-0.5">
              {item.tag}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              {item.postCount} bài đăng liên quan
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSidebar;