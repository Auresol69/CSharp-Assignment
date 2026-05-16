import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { getSignalRConnection, setupSignalRListeners, offAllSignalRListeners } from "../services/signalRService";

export interface NotificationData {
  id?: string;
  IdNotification?: string;
  toUserId?: string;
  IdTaiKhoan?: string;
  senderId?: string;
  TriggeredByUserId?: string;
  notificationType?: string;
  Type?: string;
  postId?: string;
  IdPost?: string;
  message?: string;
  Message?: string;
  timestamp?: string;
  isRead?: boolean;
  IsRead?: boolean;
}

interface NotificationContextType {
  notifications: NotificationData[];
  addNotification: (notification: NotificationData) => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const listenersSetupRef = useRef(false);

  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev]);
    console.log("📬 Nhận notification:", notification);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const setupListeners = () => {
      const connection = getSignalRConnection();
      
      // Chỉ setup listeners khi connection sẵn sàng
      if (connection && connection.state === HubConnectionState.Connected && !listenersSetupRef.current) {
        listenersSetupRef.current = true;
        setIsConnected(true);
        console.log("🔗 Setting up SignalR listeners...");

        setupSignalRListeners({
          onReceiveNotification: (data: NotificationData) => {
            console.log("📬 Nhận notification:", data);
            setNotifications((prev) => [data, ...prev]);
          },
          onReceiveMessage: (senderId: string, message: string) => {
            console.log(`💬 Message từ ${senderId}: ${message}`);
          },
          onUserConnected: (userId: string) => {
            console.log(`👤 ${userId} vừa online`);
          },
          onUserDisconnected: (userId: string) => {
            console.log(`👤 ${userId} vừa offline`);
          },
          onReceiveFriendRequest: (senderId: string, senderName: string, _senderAvatarUrl: string) => {
            console.log(`👥 ${senderName} gửi lời mời kết bạn`);
            setNotifications((prev) => [
              {
                senderId,
                Type: "FriendRequest",
                Message: `${senderName} gửi lời mời kết bạn`,
              },
              ...prev,
            ]);
          },
          onFriendRequestAccepted: (accepterId: string, accepterName: string, _accepterAvatarUrl: string) => {
            console.log(`✅ ${accepterName} chấp nhận lời mời kết bạn`);
            setNotifications((prev) => [
              {
                senderId: accepterId,
                Type: "FriendRequestAccepted",
                Message: `${accepterName} chấp nhận lời mời kết bạn`,
              },
              ...prev,
            ]);
          },
        });

        // Clear interval khi listeners setup thành công
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    // Thử setup ngay lập tức
    setupListeners();

    // Nếu connection chưa sẵn sàng, poll cho đến khi sẵn sàng (max 30 seconds)
    if (!listenersSetupRef.current) {
      let attempts = 0;
      pollInterval = setInterval(() => {
        attempts++;
        setupListeners();
        
        // Dừng poll sau 30 giây
        if (attempts > 60) {
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      // Không remove listeners ở đây để tránh mất connection khi component re-render
    };
  }, []); // Empty deps - setup ONCE

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export default NotificationContext;
