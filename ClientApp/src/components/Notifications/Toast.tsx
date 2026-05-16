import React, { useEffect } from 'react';
import { X, Bell, Users, Heart, MessageCircle } from 'lucide-react';
import type { NotificationData } from '../../context/NotificationContext';

interface ToastProps {
  notification: NotificationData;
  onRemove: (id: string) => void;
  autoClose?: number;
}

const Toast: React.FC<ToastProps> = ({ notification, onRemove, autoClose = 5000 }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(notification.id || ''), 300);
    }, autoClose);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove, autoClose]);

const getIcon = () => {
    const notificationType = notification.notificationType || notification.Type;
    switch (notificationType) {
      case 'Like':
        return <Heart size={20} className="text-red-500" fill="currentColor" />;
      case 'Comment':
        return <MessageCircle size={20} className="text-blue-500" />;
      case 'FriendRequest':
      case 'AcceptRequest':
      case 'FriendRequestAccepted':
        return <Users size={20} className="text-green-500" />;
      default:
        return <Bell size={20} className="text-yellow-500" />;
    }
  };

  const getBackgroundColor = () => {
    const notificationType = notification.notificationType || notification.Type;
    switch (notificationType) {
      case 'Like':
        return 'bg-red-50 border-red-200';
      case 'Comment':
        return 'bg-blue-50 border-blue-200';
      case 'FriendRequest':
      case 'AcceptRequest':
      case 'FriendRequestAccepted':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0'
      }`}
    >
      <div
        className={`rounded-lg border-l-4 shadow-lg p-4 mb-3 flex items-start gap-3 ${getBackgroundColor()}
          ${
            (notification.notificationType || notification.Type) === 'Like'
              ? 'border-l-red-500'
              : (notification.notificationType || notification.Type) === 'Comment'
              ? 'border-l-blue-500'
              : (notification.notificationType || notification.Type) === 'FriendRequest' ||
                (notification.notificationType || notification.Type) === 'AcceptRequest' ||
                (notification.notificationType || notification.Type) === 'FriendRequestAccepted'
              ? 'border-l-green-500'
              : 'border-l-yellow-500'
          }`}
      >
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {notification.message || notification.Message || 'Bạn có thông báo mới'}
          </p>
          {(notification.timestamp) && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString('vi-VN')}
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onRemove(notification.id || ''), 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
