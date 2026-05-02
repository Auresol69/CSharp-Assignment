import { X, Send } from 'lucide-react';
import PostCard from './PostCard';
import type { IPost } from '../../types/Post';
import { useEffect, useState } from 'react';
import { MOCK_POSTS } from '../../services/MockedData/mockPost';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import CommentItem from '../Comment/CommentItem';

interface Props {
  postId?: string;
  post?: IPost | null;
  onClose: () => void;
}

const PostDetailModal = ({ postId, post: initialPost, onClose }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const post = initialPost || MOCK_POSTS.find(p => p.id === postId);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [comments, setComments] = useState([
    { id: '1', user: 'Nguyen Van A', text: 'Bai viet hay qua bro!', avatar: 'https://i.pravatar.cc/150?u=a' },
    { id: '2', user: 'Le Thi B', text: 'Dinh cua chop SGU oi', avatar: 'https://i.pravatar.cc/150?u=b' }
  ]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleSubmitComment = async () => {
    if (!post || !commentText.trim()) return;

    try {
      setCommentError('');
      const response = await api.post('/comments', {
        idPost: post.id,
        content: commentText
      });
      const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      setComments(prev => [
        {
          id: response.data.idComment,
          user: authUser.tenTaiKhoan || 'Ban',
          text: response.data.content || commentText,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
        },
        ...prev
      ]);
      setCommentText('');
    } catch {
      setCommentError('Khong gui duoc binh luan. Bai viet mau co the chua ton tai trong database.');
    }
  };

  if (!post) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`} onClick={stopPropagation}>
          <p>Khong tim thay bai viet nay.</p>
          <button onClick={onClose} className="mt-4 text-blue-500 underline">Dong</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/70 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300
          ${isDark ? 'bg-gray-900' : 'bg-white'}`}
        onClick={stopPropagation}
      >
        <div className={`p-3 sm:p-4 border-b flex items-center justify-between sticky top-0 z-10
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="w-10 h-1 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
          <h3 className={`text-base sm:text-xl font-bold mx-auto pt-2 sm:pt-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bai viet cua {post.authorName}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors absolute right-2 sm:right-4 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          <PostCard post={post} />

          <div className="mt-4 space-y-4">
            <h4 className={`font-bold border-b pb-2 text-xs uppercase tracking-wider ${isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-100'}`}>
              Tat ca binh luan
            </h4>
            {commentError && <p className="text-sm font-bold text-red-500">{commentError}</p>}
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment}
                isReply={false}
              />
            ))}
          </div>
        </div>

        <div className={`p-3 sm:p-4 border-t flex items-center gap-2 sticky bottom-0
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <input
            type="text"
            placeholder="Viet binh luan cong khai..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitComment();
            }}
            className={`flex-1 border-none rounded-full px-4 py-2 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500
              ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
          />
          <button onClick={handleSubmitComment} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors shrink-0">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
