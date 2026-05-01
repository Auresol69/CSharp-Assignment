import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import type { IPost } from '../../types/Post';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import { useTheme } from '../../context/ThemeContext'; // Import context để đồng bộ theme

interface Props {
  post: IPost;
  isShared?: boolean;
  onTagClick?: (tag: string) => void;
}

// Hàm định dạng nội dung và xử lý click Hashtag với hỗ trợ Dark Mode
const formatContent = (content: string, onTagClick?: (tag: string) => void) => {
  if (!content) return null;
  const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          return (
            <span 
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) {
                  onTagClick(part);
                }
              }}
              // Cập nhật màu hashtag cho Dark Mode
              className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline mx-0.5 inline-block"
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

const PostCard = ({ post, isShared = false, onTagClick }: Props) => {
  const { theme } = useTheme(); // Sử dụng theme từ context để điều khiển logic hiển thị
  const isDark = theme === 'dark';
  
  const Player = ReactPlayer as any;
  const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
  const mediaUrl = post.mediaUrl;
  const { ref: inViewRef, shouldPlay, isYouTube } = useVideoPlayer(mediaUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const CHARACTER_LIMIT = 150;
  const isLongContent = post.content.length > CHARACTER_LIMIT;
  const isVideoFile = !!mediaUrl && (VIDEO_FILE_PATTERN.test(mediaUrl) || mediaUrl.includes('vjs.zencdn.net'));
  const navigate = useNavigate();

  const handleOpenDetail = () => {
    navigate(`/Home/${post.id}`);
  };

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
      className={`rounded-xl border shadow-sm mb-4 transition-all duration-300
      ${isShared ? 'p-3 ml-2 border-l-4 border-l-blue-400' : 'p-4 w-full mx-auto'}
      ${isDark 
        ? (isShared ? 'bg-gray-900 border-gray-700' : 'bg-gray-800 border-gray-700') 
        : (isShared ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200')
      }`}
    >
      <div onClick={handleOpenDetail} className='cursor-pointer'>
        <PostHeader
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          createdAt={post.createdAt}
          postId={post.id}
          onTimeClick={handleOpenDetail}
        />
      </div>

      {/* Cập nhật màu chữ cho nội dung bài viết */}
      <div className={`mb-4 leading-relaxed whitespace-pre-wrap 
        ${isDark ? 'text-gray-200' : 'text-gray-800'} 
        ${isShared ? 'text-xs' : 'text-sm'}`}>
        {formatContent(getDisplayContent(), onTagClick)}

        {isLongContent && !isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            // Đổi màu nút "Xem thêm" dựa trên theme[cite: 8, 9]
            className={`font-semibold hover:underline ml-1 focus:outline-none 
              ${isDark ? 'text-white' : 'text-black'}`}
          >
            ...Xem thêm
          </button>
        )}
      </div>

      {mediaUrl && (
        <div className={`rounded-lg overflow-hidden border mb-4 bg-black aspect-video relative 
          ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
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