import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { MOCK_TRENDING } from '../../services/MockedData/mockTrending';
import { useTheme } from '../../context/ThemeContext'; // Import để sử dụng isDark[cite: 8]

interface TrendingSidebarProps {
  setFilterTag: (tag: string) => void;
}

const TrendingSidebar = ({ setFilterTag }: TrendingSidebarProps) => {
  const { theme } = useTheme(); // Lấy trạng thái theme[cite: 8]
  const isDark = theme === 'dark';
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrending = MOCK_TRENDING.filter(item => 
    item.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`w-full  lg:w-70 h-[calc(100vh-100px)] border rounded-xl p-4 sticky top-20 self-start shadow-sm flex flex-col transition-all duration-300
      ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}>
      
      <div className={`flex items-center justify-between mb-4 border-b pb-2 min-h-11.25 relative overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <h3 className={`font-bold text-lg transition-all duration-300 transform ${
          isSearching ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'
        } ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          Xu hướng cho bạn
        </h3>

        <div className={`absolute right-0 flex items-center transition-all duration-300 ease-in-out ${
          isSearching ? 'w-full' : 'w-10'
        }`}>
          <div className="relative w-full flex items-center">
            <input 
              autoFocus={isSearching}
              type="text"
              placeholder="Tìm kiếm hashtag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearching(true)}
              className={`w-full rounded-full py-2 transition-all duration-300 outline-none ${
                isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800'
              } ${isSearching ? 'pl-10 pr-10 opacity-100' : 'pl-0 pr-0 opacity-0 cursor-pointer'}`}
            />

            <button 
              onClick={() => setIsSearching(true)}
              className={`absolute left-0 transition-all duration-300 ${
                isSearching ? 'text-gray-400 translate-x-2' : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              } rounded-full p-1`}
            >
              <Search size={20} />
            </button>

            {isSearching && (
              <button 
                onClick={() => {
                  setIsSearching(false);
                  setSearchTerm("");
                }}
                className={`absolute right-2 p-1.5 rounded-full transition-all animate-in fade-in zoom-in ${
                  isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
        {filteredTrending.length > 0 ? (
          filteredTrending.map((item, index) => (
            <div 
              key={item.tag}
              onClick={() => setFilterTag(item.tag)}
              // SỬA TẠI ĐÂY: Thay đổi màu hover động dựa trên isDark
              className={`group flex flex-col p-3 rounded-xl cursor-pointer transition-all duration-200
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Top {index + 1}
                </span>
              </div>
              <p className={`font-bold group-hover:underline mt-0.5 ${isDark ? 'text-gray-100' : 'text-black'}`}>
                {item.tag}
              </p>
              <p className={`text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.postCount.toLocaleString()} bài đăng
              </p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Search size={32} className="mb-2 opacity-20" />
            <p className="text-sm">Không tìm thấy "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingSidebar;