import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  onTimeClick?: () => void; 
}

const PostHeader = ({ authorId, authorName, authorAvatar, createdAt, onTimeClick }: Props) => {
  const navigate = useNavigate();
  const avatarSrc = authorAvatar.trim() ? authorAvatar : undefined;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/Profile/${authorId}`);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        {/* Click vào Avatar cũng mở Modal */}
        <div 
          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer" 
          onClick={handleAuthorClick}
        >
          {avatarSrc ? <img src={avatarSrc} alt={authorName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300" />}
        </div>

        <div>
          <h4 className="font-bold text-gray-900 hover:underline cursor-pointer" onClick={handleAuthorClick}>{authorName}</h4>
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
    </div>
  );
};

export default PostHeader;