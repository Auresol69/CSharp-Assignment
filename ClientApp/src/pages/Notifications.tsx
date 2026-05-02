import { useState } from "react";
import { MOCK_NOTIFICATIONS } from "../services/MockedData/mockNotifications";
import NotificationTabs from "../components/Notifications/NotificationsTab";
import NotificationItem from "../components/Notifications/NotificationsItem";
import { useTheme } from "../context/ThemeContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'moderation'>('all');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const userRole = 'admin'; 
  const isAdmin = userRole === 'admin';

  // Hàm đánh dấu 1 mục là đã đọc
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  // MỚI: Hàm đánh dấu tất cả mục đang hiển thị là đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const filteredData = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'moderation') return n.type === 'report';
    return isAdmin || n.type !== 'report';
  });

  return (
    <div className={`max-w-[calc(100%-10rem)] mx-auto min-h-screen shadow-lg border-x border-b transition-colors
      ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      
      <div className={`p-4 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md border-b
        ${isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Thông báo</h1>
        
        {/* Gán sự kiện vào đây */}
        <button 
          onClick={handleMarkAllAsRead}
          className={`text-xs font-semibold px-2 py-1 rounded transition-all
            ${isDark ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <NotificationTabs filter={filter} setFilter={setFilter} showModeration={isAdmin} />

      <div className="pb-20">
        {filteredData.length > 0 ? (
          filteredData.map(noti => (
            <NotificationItem key={noti.id} data={noti} onRead={handleMarkAsRead} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
            <p className="text-sm">Không có thông báo nào...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;