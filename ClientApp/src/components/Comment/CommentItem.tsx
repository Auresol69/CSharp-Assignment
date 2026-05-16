import { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import type { CommentItemProps, IComment } from '../../types/Comment';
import { replyToComment } from '../../services/api/commentsApi';

// 2. Gán kiểu dữ liệu cho Component Props
const CommentItem = ({ comment, isReply = false, postId }: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [localReplies, setLocalReplies] = useState<IComment[]>(comment.replies ?? []);

  const handleSendReply = async () => {
    if (!replyContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      setReplyError('');

      const response = await replyToComment(comment.id, postId, replyContent.trim());

      // Lấy thông tin user từ localStorage để hiển thị ngay
      const authRaw = localStorage.getItem('authUser') || localStorage.getItem('auth') || '{}';
      const authUser = JSON.parse(authRaw);
      const userData = authUser?.user ?? authUser;

      const newReply: IComment = {
        id: response.idComment || Date.now().toString(),
        userName: userData?.tenTaiKhoan ?? 'Bạn',
        content: response.content || replyContent.trim(),
        avatar: userData?.avatarUrl,
        replies: [],
      };

      setLocalReplies(prev => [...prev, newReply]);
      setReplyContent('');
      setShowReplyForm(false);
    } catch {
      setReplyError('Không gửi được phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex gap-3 ${isReply ? 'mt-3' : 'mt-5'}`}>
      {/* Avatar */}
      <div className="shrink-0">
        <div className={`rounded-full border-2 border-white shadow-sm overflow-hidden ${isReply ? 'w-7 h-7' : 'w-9 h-9'}`}>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`} alt="avatar" />
        </div>
      </div>

      {/* Nội dung bình luận */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block max-w-full dark:bg-gray-800">
          <p className="text-[13px] font-black text-gray-900 dark:text-white">{comment.userName}</p>
          <p className="text-sm text-gray-800 leading-relaxed dark:text-gray-300">{comment.content}</p>
        </div>

        {/* Nút tương tác */}
        <div className="flex items-center gap-4 mt-1 ml-2 text-[12px] font-bold text-gray-500">
          <button className="hover:text-blue-600 transition-colors">Thích</button>
          {/* Ẩn nút "Phản hồi" ở cấp reply (chỉ 1 cấp) */}
          {!isReply && (
            <button
              className="hover:text-blue-600 transition-colors"
              onClick={() => { setShowReplyForm(v => !v); setReplyError(''); }}
            >
              Phản hồi
            </button>
          )}
          <span className="font-medium text-gray-400 italic">Vừa xong</span>
        </div>

        {/* Form nhập Reply */}
        {showReplyForm && !isReply && (
          <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                disabled={submitting}
                className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white disabled:opacity-60"
                placeholder={`Trả lời ${comment.userName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) handleSendReply(); }}
              />
              <button
                disabled={!replyContent.trim() || submitting}
                className="bg-blue-600 text-white p-2 rounded-xl disabled:opacity-50 active:scale-95 transition-all"
                onClick={handleSendReply}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
              </button>
            </div>
            {replyError && (
              <p className="text-xs text-red-500 ml-1">{replyError}</p>
            )}
          </div>
        )}

        {/* Replies (đệ quy) */}
        {localReplies.length > 0 && (
          <div className="ml-2 mt-2 border-l-2 border-gray-200/50 dark:border-gray-700 pl-4">
            {localReplies.map((reply: IComment) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} postId={postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;