import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const CommentItem = ({ comment, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSendReply = () => {
    console.log(`Gửi reply cho bình luận ${comment.id}:`, replyContent);
    // Sau khi nối API, logic gọi axios sẽ nằm ở đây
    setReplyContent("");
    setShowReplyForm(false);
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
        <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block max-w-full">
          <p className="text-[13px] font-black text-gray-900">{comment.userName}</p>
          <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
        </div>

        {/* Nút tương tác */}
        <div className="flex items-center gap-4 mt-1 ml-2 text-[12px] font-bold text-gray-500">
          <button className="hover:text-blue-600 transition-colors">Thích</button>
          <button 
            className="hover:text-blue-600 transition-colors"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Phản hồi
          </button>
          <span className="font-medium text-gray-400 italic">2 phút trước</span>
        </div>

        {/* Form nhập Reply (Chỉ hiện khi bấm Phản hồi) */}
        {showReplyForm && (
          <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <input 
              autoFocus
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder={`Trả lời ${comment.userName}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button 
              disabled={!replyContent.trim()}
              className="bg-blue-600 text-white p-2 rounded-xl disabled:opacity-50 active:scale-95 transition-all"
              onClick={handleSendReply}
            >
              <MessageSquare size={18} />
            </button>
          </div>
        )}

        {/* Cấp độ lồng nhau (Đệ quy) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-2 mt-2 border-l-2 border-gray-200/50 pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;