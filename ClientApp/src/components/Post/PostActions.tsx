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
    <div className="grid grid-cols-3 border-t border-gray-200/50 dark:border-gray-700 pt-4 mt-4 gap-2">
      {/* Nút Like */}
      <button className="flex items-center justify-center gap-2 py-3 px-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 group hover:shadow-md hover:-translate-y-0.5">
        <ThumbsUp size={20} className="group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Thích</span>
        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 px-2 py-1 rounded-full">{likesCount > 0 ? likesCount : ""}</span>
      </button>

      {/* Nút Comment */}
      <button 
        onClick={onCommentClick}
        className="flex items-center justify-center gap-2 py-3 px-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 group hover:shadow-md hover:-translate-y-0.5"
      >
        <MessageCircle size={20} className="group-hover:text-green-500 dark:group-hover:text-green-400 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-semibold group-hover:text-green-600 dark:group-hover:text-green-400">Bình luận</span>
        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 group-hover:bg-green-200 dark:group-hover:bg-green-800 px-2 py-1 rounded-full">{commentsCount > 0 ? commentsCount : ""}</span>
      </button>

      {/* Nút Share */}
      <button 
        onClick={handleShare}
        className={`flex items-center justify-center gap-2 py-3 px-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
          ${isShared ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-600 dark:text-gray-300'}`}
      >
        <Share2 size={20} fill={isShared ? "currentColor" : "none"} className={`${isShared ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
        <span className="text-sm font-semibold">Chia sẻ</span>
        <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 px-2 py-1 rounded-full">{currentShares > 0 ? currentShares : ""}</span>
      </button>
    </div>
  );
};

export default PostActions;
