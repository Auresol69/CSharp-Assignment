import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, MoreHorizontal, Circle, ShieldAlert, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import type { INotification } from '../../types/Notifications';

interface NotificationItemProps {
  data: INotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({ data, onRead, onDelete }: NotificationItemProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = () => {
    if (showMenu) return;
    onRead(data.id);
    if (data.targetUrl) {
      navigate(data.targetUrl);
      if (data.targetUrl.includes('#')) {
        const elementId = data.targetUrl.split('#')[1];
        setTimeout(() => {
          document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  const renderIcon = (type: string) => {
    const iconClass = `absolute -bottom-1 -right-1 p-0.5 rounded-full border-2 ${isDark ? 'border-gray-900' : 'border-white'}`;
    switch (type) {
      case 'like': return <div className={`bg-red-500 ${iconClass}`}><Heart size={10} fill="white" className="text-white" /></div>;
      case 'comment': return <div className={`bg-green-500 ${iconClass}`}><MessageCircle size={10} fill="white" className="text-white" /></div>;
      case 'follow': return <div className={`bg-blue-500 ${iconClass}`}><UserPlus size={10} fill="white" className="text-white" /></div>;
      case 'report': return <div className={`bg-orange-500 ${iconClass}`}><ShieldAlert size={10} className="text-white" /></div>;
      default: return null;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 flex items-start gap-4 cursor-pointer transition-colors relative border-b ${
        isDark ? 'border-gray-800/80' : 'border-gray-200'
      } ${!data.isRead
        ? (isDark ? 'bg-blue-900/20' : 'bg-blue-50/40')
        : (isDark ? 'bg-gray-900' : 'bg-white')
      } hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}
    >
      <div className="relative shrink-0">
        {data.user.avatar?.trim() ? (
          <img src={data.user.avatar} className={`w-12 h-12 rounded-full object-cover border ${isDark ? 'border-gray-700' : 'border-gray-200'}`} alt="avatar" />
        ) : (
          <div className={`w-12 h-12 rounded-full bg-gray-300 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
        )}
        {renderIcon(data.type)}
      </div>

      <div className="flex-1">
        <p className={`text-sm leading-tight ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.user.name}</span>
          {data.type === 'report' ? ` đã báo cáo: "${data.content}"` : ` ${data.content}`}
        </p>
        <span className={`text-[11px] mt-1 block ${!data.isRead ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{data.time}</span>
      </div>

      {data.targetImage?.trim() ? <img src={data.targetImage} className={`w-10 h-10 rounded-md object-cover shrink-0 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`} alt="target" /> : null}

      {/* Menu button + dropdown */}
      <div ref={menuRef} className="flex flex-col items-center justify-between self-stretch relative">
        <button
          onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
          className={`p-1 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          aria-label="Tùy chọn thông báo"
        >
          <MoreHorizontal size={16} />
        </button>

        {showMenu && (
          <div className={`absolute top-7 right-0 z-30 w-48 rounded-xl shadow-lg border overflow-hidden
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {!data.isRead && (
              <button
                onClick={e => { e.stopPropagation(); onRead(data.id); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
                  ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <Check size={14} className="text-blue-500" />
                Đánh dấu đã đọc
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDelete(data.id); setShowMenu(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
                ${isDark ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
            >
              <Trash2 size={14} />
              Xóa thông báo
            </button>
          </div>
        )}

        {!data.isRead && <Circle size={10} fill={isDark ? "#60a5fa" : "#2563eb"} className={isDark ? "text-blue-400" : "text-blue-600"} />}
      </div>
    </div>
  );
};

export default NotificationItem;