import { useState, useEffect } from "react";
import { getNotifications } from "../services/api/notificationApi";
import NotificationTabs from "../components/Notifications/NotificationsTab";
import NotificationItem from "../components/Notifications/NotificationsItem";
import { useTheme } from "../context/ThemeContext";
import type { INotification } from "../types/Notifications";

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'moderation'>('all');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAdmin = true;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        if (data.length > 0) {
          const mapped: INotification[] = data.map(n => ({
            id: n.idNotification,
            type: (n.type === 'like' || n.type === 'comment' || n.type === 'follow' || n.type === 'report' ? n.type : 'like') as any,
            user: {
              name: n.triggeredByUserName ?? 'Unknown',
              avatar: n.triggeredByAvatarUrl ?? 'https://i.pravatar.cc/150',
            },
            content: n.message ?? 'Thực hiện một hành động',
            time: 'vừa xong',
            isRead: n.isRead,
            targetImage: undefined,
            targetUrl: n.idPost ? `/Home/posts/${n.idPost}` : undefined,
          }));
          setNotifications(mapped);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      const { markAsRead } = await import('../services/api/notificationApi');
      await markAsRead(id);
    } catch {
      // Rollback nếu API fail
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  };

  const handleMarkAllAsRead = async () => {
    const snapshot = notifications;
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    try {
      const { markAllAsRead } = await import('../services/api/notificationApi');
      await markAllAsRead();
    } catch {
      setNotifications(snapshot);
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = notifications;
    setNotifications(p => p.filter(n => n.id !== id));
    try {
      const { deleteNotification } = await import('../services/api/notificationApi');
      await deleteNotification(id);
    } catch {
      setNotifications(snapshot);
    }
  };

  const filteredData = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === 'report');

  return (
    <div className={`w-full max-w-4xl mx-auto min-h-screen shadow-lg transition-colors border-x
      ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      
      <div className={`p-4 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md border-b
        ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <h1 className="text-xl font-bold">Thông báo</h1>
        <button 
          onClick={handleMarkAllAsRead}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
            ${isDark ? 'text-blue-400 hover:bg-blue-900/50' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="px-2">
        <NotificationTabs filter={filter} setFilter={setFilter} showModeration={isAdmin} />
      </div>

      <div className="pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-500 opacity-60">
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : (
          filteredData.length > 0 ? (
            filteredData.map(noti => (
              <NotificationItem key={noti.id} data={noti} onRead={handleMarkAsRead} onDelete={handleDelete} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center pt-20 text-gray-500 opacity-60">
              <p className="text-sm">Không có thông báo nào...</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Notifications;
