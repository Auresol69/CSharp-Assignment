// File: src/components/Post/PostActions.tsx
import { useState } from 'react';
import { MessageCircle, ThumbsUp, Share2 } from 'lucide-react';

interface PostActionsProps {
  onCommentClick?: () => void;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

const PostActions = ({ 
  onCommentClick, 
  likesCount = 0, 
  commentsCount = 0, 
  sharesCount = 0 
}: PostActionsProps) => {
  const [isShared, setIsShared] = useState(false);
  const [currentShares, setCurrentShares] = useState(sharesCount);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Giả lập logic chia sẻ về trang cá nhân
    if (!isShared) {
      setIsShared(true);
      setCurrentShares(prev => prev + 1);
      // Sau này gọi API ở đây: await sharePostApi(postId);
    }
    else {
      setIsShared(false);
      setCurrentShares(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="flex items-center justify-start border-t border-gray-100 pt-2 mt-2 space-x-4">
      {/* Nút Like */}
      <button className="flex items-center space-x-1 py-2 px-3 hover:bg-gray-50 rounded-lg transition text-gray-600 group">
        <ThumbsUp size={18} className="group-hover:text-blue-500" />
        <span className="text-xs font-medium">{likesCount > 0 ? likesCount : ""}</span>
      </button>

      {/* Nút Comment */}
      <button 
        onClick={onCommentClick}
        className="flex items-center space-x-1 py-2 px-3 hover:bg-gray-50 rounded-lg transition text-gray-600 group"
      >
        <MessageCircle size={18} className="group-hover:text-green-500" />
        <span className="text-xs font-medium">{commentsCount > 0 ? commentsCount : ""}</span>
      </button>

      {/* Nút Share */}
      <button 
        onClick={handleShare}
        className={`flex items-center space-x-1 py-2 px-3 hover:bg-gray-50 rounded-lg transition 
          ${isShared ? 'text-blue-600' : 'text-gray-600'}`}
      >
        <Share2 size={18} fill={isShared ? "currentColor" : "none"} />
        <span className="text-xs font-medium">{currentShares > 0 ? currentShares : ""}</span>
      </button>
    </div>
  );
};

export default PostActions;