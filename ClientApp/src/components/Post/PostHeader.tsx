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
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        {/* Click vào Avatar cũng mở Modal */}
        <div 
          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            if (onTimeClick) onTimeClick();
          }}
        >
          <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
        </div>

        <div>
          <h4 className="font-bold text-gray-900 hover:underline cursor-pointer">{authorName}</h4>
          <p className="text-xs text-gray-500 flex items-center">
            {/* 2. Gắn sự kiện click vào khung thời gian */}
            <span 
              className="hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                if (onTimeClick) onTimeClick(); // Gọi hàm mở Modal
              }}
            >
              {createdAt}
            </span>
            <span className="mx-1">·</span>
            <Globe size={12} />
          </p>
        </div>
      </div>

      <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
};

export default PostHeader;