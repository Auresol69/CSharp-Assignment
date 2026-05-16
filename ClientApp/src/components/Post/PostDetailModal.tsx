import { X, Send, Loader2 } from 'lucide-react';
import PostCard from './PostCard';
import type { IPost, IPostResponseDto } from '../../types/Post';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getPostById } from '../../services/api/postsApi';
import { getCommentsByPost, createComment } from '../../services/api/commentsApi';
import type { ICommentResponseDto } from '../../types/Post';
import CommentItem from '../Comment/CommentItem';
import type { IComment } from '../../types/Comment';

interface Props {
  postId?: string;
  post?: IPost | null;
  onClose: () => void;
}

function mapDtoToIPost(dto: IPostResponseDto): IPost {
  return {
    id: dto.idPost,
    authorId: dto.taiKhoan?.id ?? '',
    authorName: dto.taiKhoan?.tenTaiKhoan ?? 'Unknown',
    authorAvatar: dto.taiKhoan?.avatarUrl ?? '',
    createdAt: dto.createdAt,
    content: dto.content,
    mediaUrl: dto.media && dto.media.length > 0 ? dto.media[0].url : undefined,
    sharedPost: undefined,
    likesCount: dto.likesCount,
    commentsCount: dto.commentsCount,
    sharesCount: dto.repostsCount ?? 0,
  };
}

function mapDtoToIComment(dto: ICommentResponseDto): IComment {
  return {
    id: dto.idComment,
    userName: dto.taiKhoan?.tenTaiKhoan ?? 'Người dùng',
    content: dto.content,
    avatar: dto.taiKhoan?.avatarUrl ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anon',
    replies: dto.replies?.map(mapDtoToIComment) ?? [],
  };
}

const PostDetailModal = ({ postId, post: initialPost, onClose }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [post, setPost]                   = useState<IPost | null>(initialPost ?? null);
  const [postLoading, setPostLoading]     = useState(!initialPost && !!postId);
  const [comments, setComments]           = useState<IComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText]     = useState('');
  const [commentError, setCommentError]   = useState('');
  const [submitting, setSubmitting]       = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Load post nếu chỉ có postId (không có initialPost)
  useEffect(() => {
    if (initialPost || !postId) return;
    setPostLoading(true);
    getPostById(postId)
      .then((dto) => setPost(mapDtoToIPost(dto)))
      .catch(() => setPost(null))
      .finally(() => setPostLoading(false));
  }, [postId, initialPost]);

  // Load comments khi biết post
  useEffect(() => {
    const id = post?.id ?? postId;
    if (!id) return;
    setCommentsLoading(true);
    getCommentsByPost(id)
      .then((dtos) => setComments(dtos.map(mapDtoToIComment)))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [post?.id, postId]);

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  const handleSubmitComment = async () => {
    const id = post?.id ?? postId;
    if (!id || !commentText.trim()) return;

    try {
      setSubmitting(true);
      setCommentError('');
      const response = await createComment(id, commentText.trim());

      const authUser = JSON.parse(localStorage.getItem('authUser') || localStorage.getItem('auth') || '{}');
      const userData = authUser?.user ?? authUser;

      const newComment: IComment = {
        id: response.idComment || Date.now().toString(),
        userName: userData?.tenTaiKhoan ?? 'Bạn',
        content: response.content || commentText,
        avatar: userData?.avatarUrl ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
        replies: [],
      };

      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch {
      setCommentError('Không gửi được bình luận. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state cho post
  if (postLoading) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className={`p-8 rounded-xl flex flex-col items-center gap-3 ${isDark ? 'bg-gray-900 text-white' : 'bg-white'}`} onClick={stopPropagation}>
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p className="text-sm">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  // Post not found
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
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          <PostCard post={post} />

          <div className="mt-4 space-y-4">
            <h4 className={`font-bold border-b pb-2 text-xs uppercase tracking-wider ${isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-100'}`}>
              Tất cả bình luận
              {!commentsLoading && comments.length > 0 && (
                <span className="ml-2 font-normal normal-case">({comments.length})</span>
              )}
            </h4>

            {commentError && <p className="text-sm font-bold text-red-500">{commentError}</p>}

            {commentsLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Đang tải bình luận...</span>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isReply={false}
                  postId={post?.id ?? postId ?? ''}
                />
              ))
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}
          </div>
        </div>

        {/* Comment input */}
        <div className={`p-3 sm:p-4 border-t flex items-center gap-2 sticky bottom-0
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <input
            type="text"
            placeholder="Viết bình luận..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) handleSubmitComment(); }}
            disabled={submitting}
            className={`flex-1 border-none rounded-full px-4 py-2 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60
              ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
          />
          <button
            onClick={handleSubmitComment}
            disabled={submitting || !commentText.trim()}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors shrink-0 disabled:opacity-40"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
