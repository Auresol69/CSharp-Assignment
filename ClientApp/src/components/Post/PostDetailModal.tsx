import { X, Send } from 'lucide-react';
import PostCard from './PostCard';
import type { IPost } from '../../types/Post';
import { useEffect } from 'react';
import { MOCK_POSTS } from '../../services/MockedData/mockPost'; // 1. PHẢI IMPORT MOCK DATA

interface Props {
  postId?: string;
  post?: IPost | null; 
  onClose: () => void;
}

const PostDetailModal = ({ postId, post: initialPost, onClose }: Props) => {
  // 2. LOGIC QUAN TRỌNG: Nếu không có post truyền trực tiếp, hãy tìm trong MOCK_POSTS bằng postId
  const post = initialPost || MOCK_POSTS.find(p => p.id === postId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  // 3. Nếu vẫn không tìm thấy bài viết thì hiện thông báo hoặc đóng modal
  if (!post) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div className="bg-white p-6 rounded-xl" onClick={stopPropagation}>
          <p>Không tìm thấy bài viết này.</p>
          <button onClick={onClose} className="mt-4 text-blue-500 underline">Đóng</button>
        </div>
      </div>
    );
  }

  const dummyComments = [
    { id: 1, user: "Nguyễn Văn A", text: "Bài viết hay quá bro!", avatar: "https://via.placeholder.com/32" },
    { id: 2, user: "Lê Thị B", text: "Đỉnh của chóp SGU ơi", avatar: "https://via.placeholder.com/32" }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
        onClick={stopPropagation}
      >
        {/* Header Modal */}
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-900 mx-auto">Bài viết của {post.authorName}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors absolute right-4"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Hiển thị PostCard chi tiết */}
          <PostCard post={post} />

          {/* Danh sách bình luận */}
          <div className="mt-4 space-y-4">
            <h4 className="font-bold border-b pb-2 text-sm text-gray-600">Tất cả bình luận</h4>
            {dummyComments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 items-start">
                <img src={comment.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
                <div className="bg-gray-100 p-3 rounded-2xl text-xs flex-1">
                  <p className="font-bold text-gray-800 mb-1">{comment.user}</p>
                  <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ô nhập bình luận */}
        <div className="p-4 border-t flex items-center gap-2 bg-white">
          <input 
            type="text" 
            placeholder="Viết bình luận công khai..." 
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;