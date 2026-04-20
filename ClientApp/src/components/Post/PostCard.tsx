import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import{ useNavigate } from 'react-router-dom';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import type { IPost } from '../../types/Post';
import PostActions from './PostActions';
import PostHeader from './PostHeader';

interface Props {
  post: IPost;
  isShared?: boolean;
  onTagClick?: (tag: string) => void;
}

// Hàm định dạng nội dung và xử lý click Hashtag
const formatContent = (content: string, onTagClick?: (tag: string) => void) => {
  if (!content) return null;
  const parts = content.split(/(#[a-zA-Z0-9_]+)/g); // Tách nội dung thành các phần, giữ lại hashtag như một phần riêng biệt
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          return (
            <span 
              key={index}
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài thẻ Card
                if (onTagClick) {
                  onTagClick(part); // Thực hiện hàm lọc bài viết
                }
              }}
              className="text-blue-600 font-semibold cursor-pointer hover:underline mx-0.5 inline-block"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const PostCard = ({ post, isShared = false, onTagClick }: Props) => { // ĐÃ FIX: Thêm onTagClick vào đây
  const Player = ReactPlayer as any;
  const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
  const mediaUrl = post.mediaUrl;
  const { ref: inViewRef, shouldPlay, isYouTube } = useVideoPlayer(mediaUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Trạng thái mở rộng nội dung
  const CHARACTER_LIMIT = 150; // Giới hạn ký tự hiển thị ban đầu
  const isLongContent = post.content.length > CHARACTER_LIMIT;// Kiểm tra xem nội dung có vượt quá giới hạn không
  const isVideoFile = !!mediaUrl && (VIDEO_FILE_PATTERN.test(mediaUrl) || mediaUrl.includes('vjs.zencdn.net'));
  const navigate = useNavigate();
  const handleOpenDetail = () => {
    navigate(`/Home/${post.id}`); // Cập nhật URL khi mở Modal
  };

  // Hàm quyết định hiển thị nội dung đầy đủ hay thu gọn
  const getDisplayContent = () => {
    if (isExpanded || !isLongContent) {
      return post.content;
    }
    return post.content.slice(0, CHARACTER_LIMIT);
  };

  useEffect(() => {
    if (!isYouTube && isVideoFile && videoRef.current) {
      if (shouldPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoFile, isYouTube, shouldPlay]);

  return (
    <div
      ref={inViewRef}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm mb-4
      ${isShared ? 'p-3 ml-2 border-l-4 border-l-blue-400 bg-gray-50' : 'p-4 w-full mx-auto'}`}
    >
      <div onClick={handleOpenDetail} className='cursor-pointer'>
        <PostHeader
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          createdAt={post.createdAt}
          postId={post.id}
          onTimeClick={handleOpenDetail} // Mở Modal khi click vào thời gian
        />
      </div>

      <div className={`text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap ${isShared ? 'text-xs' : 'text-sm'}`}>
        {formatContent(getDisplayContent(), onTagClick)}

        {/* Hiển thị nút Xem thêm nếu nội dung dài và chưa mở rộng */}
        {isLongContent && !isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn mở Modal chi tiết khi chỉ muốn xem thêm text
              setIsExpanded(true);
            }}
            className="text-black font-semibold hover:underline ml-1 focus:outline-none"
          >
            ...Xem thêm
          </button>
        )}
      </div>

      {mediaUrl && (
        <div className="rounded-lg overflow-hidden border border-gray-100 mb-4 bg-black aspect-video relative">
          {isYouTube ? (
            <div className="w-full h-full">
              <Player
                key={mediaUrl}
                src={mediaUrl} 
                playing={shouldPlay}
                muted={true}
                controls={true}
                playsInline={true}
                width="100%"
                height="100%"
              />
            </div>
          ) : isVideoFile ? (
            <video
              ref={videoRef}
              key={mediaUrl}
              src={mediaUrl}
              muted
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Content"
              className="w-full h-auto object-cover max-h-[500px]"
            />
          )}
        </div>
      )}

      {post.sharedPost && (
        <div className="mt-2 mb-4">
          <PostCard post={post.sharedPost} isShared={true} onTagClick={onTagClick} />
        </div>
      )}

      {!isShared && (
        <PostActions onCommentClick={handleOpenDetail} />
        )}
    </div>
  );
};

export default PostCard;