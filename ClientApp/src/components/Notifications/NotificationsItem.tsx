import { Heart, MessageCircle, UserPlus, MoreHorizontal, Circle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import type { INotification } from '../../types/Notifications';

const NotificationItem = ({ data, onRead }: { data: INotification, onRead: (id: string) => void }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    onRead(data.id); // Cập nhật trạng thái đã đọc (đổi màu nền)
    
    if (data.targetUrl) {
      navigate(data.targetUrl); // Điều hướng tới bài viết/bình luận
      
      // Logic cuộn tới phần tử cụ thể nếu có Hash ID
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
        : (isDark ? 'bg-gray-900' : 'bg-white') // Đã đọc thì về màu nền chuẩn
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
      
      <div className="flex flex-col items-center justify-between self-stretch">
        <button className={isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}><MoreHorizontal size={16} /></button>
        {!data.isRead && <Circle size={10} fill={isDark ? "#60a5fa" : "#2563eb"} className={isDark ? "text-blue-400" : "text-blue-600"} />}
      </div>
    </div>
  );
};

export default NotificationItem;