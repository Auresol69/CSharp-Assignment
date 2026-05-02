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
              className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 hover:underline decoration-2 mx-0.5 inline-block transition-colors duration-200"
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

  // GIẢ ĐỊNH: Lấy thông tin user hiện tại (ní thay bằng logic thực tế của ní nhé)
  const currentUser = { id: "user_123", role: "admin" }; 
  const isAdmin = currentUser.role === "admin";
  const isOwner = currentUser.id === post.authorId; // Giả định IPost có authorId

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

  // --- LOGIC KIỂM TRA ROLE TẠI ĐÂY ---
  const menuItems = [
    { icon: <Bookmark size={18} />, label: 'Lưu bài viết', onClick: () => console.log('Saved') },
    { icon: <EyeOff size={18} />, label: 'Ẩn bài viết', onClick: () => setIsHidden(true) },
    { icon: <Flag size={18} />, label: 'Báo cáo', onClick: () => console.log('Reported'), danger: true },
    { icon: <Share2 size={18} />, label: 'Sao chép link', onClick: () => navigator.clipboard.writeText(window.location.origin + `/Home/${post.id}`) },
  ];

  // Chỉ Admin hoặc Chủ bài viết mới thấy nút Xóa và Chỉnh sửa
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
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-lg mb-6 transition-all duration-300 hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1
      ${isShared ? 'p-4 ml-3 border-l-4 border-l-gradient-to-r from-blue-400 to-blue-600 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800' : 'p-6 w-full mx-auto max-w-2xl'}`}
    >
      <div className="flex justify-between items-start">
        <div onClick={handleOpenDetail} className='cursor-pointer flex-1'>
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
            className={`p-2 rounded-full transition-all outline-none focus:ring-0 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border z-30 overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="py-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); item.onClick(); setShowMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
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

      <div className={`text-gray-900 dark:text-gray-100 mb-6 leading-relaxed whitespace-pre-wrap font-medium ${isShared ? 'text-xs' : 'text-base'}`}>
        {formatContent(getDisplayContent(), onTagClick)}
        {isLongContent && !isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn mở Modal chi tiết khi chỉ muốn xem thêm text
              setIsExpanded(true);
            }}
            className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 hover:underline decoration-2 ml-2 focus:outline-none transition-all duration-200 transform hover:scale-105"
          >
            ...Xem thêm
          </button>
        )}
      </div>

      {mediaUrl && (
        <div className="rounded-2xl overflow-hidden border border-gray-200/30 dark:border-gray-600 mb-6 bg-gradient-to-br from-gray-900 to-black dark:from-gray-950 dark:to-black aspect-video relative shadow-inner">
          {isYouTube ? (
            <div className="w-full h-full">
              <Player src={mediaUrl} playing={shouldPlay} muted controls width="100%" height="100%" />
            </div>
          ) : isVideoFile ? (
            <video ref={videoRef} src={mediaUrl} muted controls className="w-full h-full object-contain" />
          ) : (
            <img src={mediaUrl} alt="Content" className="w-full h-auto object-cover max-h-125" />
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
