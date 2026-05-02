import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import { 
  MoreHorizontal, EyeOff, Flag, Bookmark, 
  Trash2, Edit3, Share2 
} from 'lucide-react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import type { IPost } from '../../types/Post';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  post: IPost;
  isShared?: boolean;
  onTagClick?: (tag: string) => void;
}

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
                if (onTagClick) onTagClick(part);
              }}
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = { id: "user_123", role: "admin" }; 
  const isAdmin = currentUser.role === "admin";
  const isOwner = currentUser.id === post.authorId;

  const Player = ReactPlayer as any;
  const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
  const mediaUrl = post.mediaUrl;
  const { ref: inViewRef, shouldPlay, isYouTube } = useVideoPlayer(mediaUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const CHARACTER_LIMIT = 150;
  const isLongContent = post.content ? post.content.length > CHARACTER_LIMIT : false;
  const isVideoFile = !!mediaUrl && (VIDEO_FILE_PATTERN.test(mediaUrl) || mediaUrl.includes('vjs.zencdn.net'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isYouTube && isVideoFile && videoRef.current) {
      if (shouldPlay) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [isVideoFile, isYouTube, shouldPlay]);

  const handleOpenDetail = () => navigate(`/Home/${post.id}`);

  const getDisplayContent = () => {
    if (isExpanded || !isLongContent) return post.content;
    return post.content.slice(0, CHARACTER_LIMIT);
  };

  const menuItems = [
    { icon: <Bookmark size={18} />, label: 'Lưu bài viết', onClick: () => console.log('Saved') },
    { icon: <EyeOff size={18} />, label: 'Ẩn bài viết', onClick: () => setIsHidden(true) },
    { icon: <Flag size={18} />, label: 'Báo cáo', onClick: () => console.log('Reported'), danger: true },
    { icon: <Share2 size={18} />, label: 'Sao chép link', onClick: () => navigator.clipboard.writeText(window.location.origin + `/Home/${post.id}`) },
  ];

  if (isOwner) {
    menuItems.push({ icon: <Edit3 size={18} />, label: 'Chỉnh sửa', onClick: () => console.log('Edit') });
  }

  if (isAdmin || isOwner) {
    menuItems.push({ icon: <Trash2 size={18} />, label: 'Xóa bài', onClick: () => console.log('Delete'), danger: true });
  }

  if (isHidden) {
    return (
      <div className={`p-4 rounded-xl border mb-4 text-center ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
        <p className="text-sm mr-2 inline">Bài viết đã được ẩn.</p>
        <button onClick={() => setIsHidden(false)} className="text-blue-500 font-bold hover:underline text-sm">Hoàn tác</button>
      </div>
    );
  }

  return (
    <div
      ref={inViewRef}
      className={`rounded-2xl border shadow-sm mb-4 transition-all duration-300 relative
      ${isShared ? 'p-3 ml-2 border-l-4 border-l-blue-400' : 'p-3 sm:p-4 w-full mx-auto'}
      ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
    >
      <div className="flex justify-between items-start">
        <div onClick={handleOpenDetail} className='cursor-pointer flex-1 min-w-0'>
          <PostHeader
            authorName={post.authorName}
            authorAvatar={post.authorAvatar}
            createdAt={post.createdAt}
            postId={post.id}
            onTimeClick={handleOpenDetail}
          />
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={`p-2 rounded-full transition-all outline-none ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className={`absolute right-0 mt-2 w-48 sm:w-52 rounded-xl shadow-2xl border z-30 overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="py-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); item.onClick(); setShowMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      ${item.danger ? 'text-red-500' : (isDark ? 'text-gray-200' : 'text-gray-700')}`}
                  >
                    {item.icon} <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`my-3 sm:my-4 leading-relaxed whitespace-pre-wrap wrap-break-word ${isDark ? 'text-gray-200' : 'text-gray-800'} ${isShared ? 'text-xs' : 'text-sm sm:text-base'}`}>
        {formatContent(getDisplayContent(), onTagClick)}
        {isLongContent && !isExpanded && (
          <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }} className={`font-semibold hover:underline ml-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            ...Xem thêm
          </button>
        )}
      </div>

      {mediaUrl && (
        <div className={`rounded-xl overflow-hidden border mb-3 sm:mb-4 bg-black aspect-video relative ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          {isYouTube ? (
            <div className="w-full h-full">
              <Player url={mediaUrl} playing={shouldPlay} muted controls width="100%" height="100%" />
            </div>
          ) : isVideoFile ? (
            <video ref={videoRef} src={mediaUrl} muted controls className="w-full h-full object-contain" />
          ) : (
            <img src={mediaUrl} alt="Content" className="w-full h-full object-cover sm:object-contain" />
          )}
        </div>
      )}

      {post.sharedPost && (
        <div className="mt-2 mb-4">
          <PostCard post={post.sharedPost} isShared={true} onTagClick={onTagClick} />
        </div>
      )}

      {!isShared && <PostActions onCommentClick={handleOpenDetail} />}
    </div>
  );
};

export default PostCard;