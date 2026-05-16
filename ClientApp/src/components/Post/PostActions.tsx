import { useState } from 'react';
import { MessageCircle, ThumbsUp, Share2 } from 'lucide-react';
import api from '../../services/api';

interface PostActionsProps {
  postId: string;
  onCommentClick?: () => void;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

const PostActions = ({
  postId,
  onCommentClick,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0
}: PostActionsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likesCount);
  const [currentShares, setCurrentShares] = useState(sharesCount);
  const [isBusy, setIsBusy] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked || isBusy) return;

    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const userId = auth?.user?.id;
    
    if (!userId) {
      console.error('❌ Like: User not authenticated', { auth });
      return;
    }

    try {
      setIsBusy(true);
      console.log('📤 Like: Sending request', { userId, postId });
      
      const response = await api.post('/interaction/AddLike', {
        IdTaiKhoan: userId,
        IdPost: postId
      });
      
      console.log('✅ Like: Success', response);
      setIsLiked(true);
      setCurrentLikes(prev => prev + 1);
    } catch (error) {
      console.error('❌ Like: Error', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShared || isBusy) return;

    try {
      setIsBusy(true);
      await api.post(`/post/${postId}/repost`, { content: '' });
      setIsShared(true);
      setCurrentShares(prev => prev + 1);
    } catch {
      // Repost only works for posts that exist in the backend database.
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-start border-t border-gray-100 pt-2 mt-2 space-x-4">
      <button
        onClick={handleLike}
        className={`flex items-center space-x-1 py-2 px-3 hover:bg-gray-50 rounded-lg transition group ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
      >
        <ThumbsUp size={18} className="group-hover:text-blue-500" fill={isLiked ? 'currentColor' : 'none'} />
        <span className="text-xs font-medium">{currentLikes > 0 ? currentLikes : ''}</span>
      </button>

      <button
        onClick={onCommentClick}
        className="flex items-center space-x-1 py-2 px-3 hover:bg-gray-50 rounded-lg transition text-gray-600 group"
      >
        <MessageCircle size={18} className="group-hover:text-green-500" />
        <span className="text-xs font-medium">{commentsCount > 0 ? commentsCount : ''}</span>
      </button>

      <button
        onClick={handleShare}
        className={`flex items-center space-x-1 py-2 px-3 hover:bg-gray-50 rounded-lg transition
          ${isShared ? 'text-blue-600' : 'text-gray-600'}`}
      >
        <Share2 size={18} fill={isShared ? 'currentColor' : 'none'} />
        <span className="text-xs font-medium">{currentShares > 0 ? currentShares : ''}</span>
      </button>
    </div>
  );
};

export default PostActions;
