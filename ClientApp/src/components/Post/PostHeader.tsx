import { MoreHorizontal, Globe } from "lucide-react";

interface Props {
  postId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  onTimeClick?: () => void; 
}

const PostHeader = ({ authorName, authorAvatar, createdAt, onTimeClick }: Props) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {/* Click vào Avatar cũng mở Modal */}
        <div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 overflow-hidden cursor-pointer ring-2 ring-white dark:ring-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" 
          onClick={(e) => {
            e.stopPropagation();
            if (onTimeClick) onTimeClick();
          }}
        >
          <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors duration-200 text-lg">{authorName}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center font-medium">
            {/* 2. Gắn sự kiện click vào khung thời gian */}
            <span 
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                if (onTimeClick) onTimeClick(); // Gọi hàm mở Modal
              }}
            >
              {createdAt}
            </span>
            <span className="mx-2 text-gray-400 dark:text-gray-500">·</span>
            <Globe size={14} className="text-gray-500 dark:text-gray-400" />
          </p>
        </div>
      </div>

      <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 p-3 rounded-full transition-all duration-200 hover:scale-110">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
};

export default PostHeader;