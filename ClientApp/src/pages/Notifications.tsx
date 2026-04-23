import { useState } from "react";
import { MOCK_NOTIFICATIONS } from "../services/MockedData/mockNotifications";
import NotificationTabs from "../components/Notifications/NotificationsTab";
import NotificationItem from "../components/Notifications/NotificationsItem";

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredData = filter === 'all' 
    ? MOCK_NOTIFICATIONS 
    : MOCK_NOTIFICATIONS.filter(n => !n.isRead);

  return (
    <div className="max-w-[calc(100%-10rem)] ml-36 bg-white min-h-screen shadow-sm border-x border-gray-100">
      <div className="p-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
        <button className="text-blue-600 text-xs font-semibold hover:bg-blue-50 px-2 py-1 rounded">
          Đánh dấu đã đọc
        </button>
      </div>

      <NotificationTabs filter={filter} setFilter={setFilter} />

      <div className="pb-20">
        {filteredData.length > 0 ? (
          filteredData.map((noti) => (
            <NotificationItem key={noti.id} data={noti} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
            <p className="text-sm">Chưa có thông báo nào ở đây...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;