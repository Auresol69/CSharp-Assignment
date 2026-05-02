import { X, Send } from 'lucide-react';
import PostCard from './PostCard';
import type { IPost } from '../../types/Post';
import { useEffect } from 'react';
import { MOCK_POSTS } from '../../services/MockedData/mockPost';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  postId?: string;
  post?: IPost | null; 
  onClose: () => void;
}

const PostDetailModal = ({ postId, post: initialPost, onClose }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const post = initialPost || MOCK_POSTS.find(p => p.id === postId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  if (!post) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`} onClick={stopPropagation}>
          <p>Không tìm thấy bài viết này.</p>
          <button onClick={onClose} className="mt-4 text-blue-500 underline">Đóng</button>
        </div>
      </div>
    );
  }

  const dummyComments = [
    { id: 1, user: "Nguyễn Văn A", text: "Bài viết hay quá bro!", avatar: "https://i.pravatar.cc/150?u=a" },
    { id: 2, user: "Lê Thị B", text: "Đỉnh của chóp SGU ơi", avatar: "https://i.pravatar.cc/150?u=b" }
  ];

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
        {/* Header Modal */}
        <div className={`p-3 sm:p-4 border-b flex items-center justify-between sticky top-0 z-10 
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="w-10 h-1 bg-gray-300 rounded-full absolute top-2 left-1/2 -translate-x-1/2 sm:hidden" />
          <h3 className={`text-base sm:text-xl font-bold mx-auto pt-2 sm:pt-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bài viết của {post.authorName}
          </h3>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors absolute right-2 sm:right-4 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          <PostCard post={post} />

          <div className="mt-4 space-y-4">
            <h4 className={`font-bold border-b pb-2 text-xs uppercase tracking-wider ${isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-100'}`}>
              Tất cả bình luận
            </h4>
            {dummyComments.map((comment) => (
              <div key={comment.id} className="flex space-x-2 sm:space-x-3 items-start">
                <img src={comment.avatar} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-200" alt="avatar" />
                <div className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm flex-1 
                  ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  <p className="font-bold mb-0.5">{comment.user}</p>
                  <p className="leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ô nhập bình luận */}
        <div className={`p-3 sm:p-4 border-t flex items-center gap-2 sticky bottom-0 
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <input 
            type="text" 
            placeholder="Viết bình luận công khai..." 
            className={`flex-1 border-none rounded-full px-4 py-2 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500
              ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
          />
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors shrink-0">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;