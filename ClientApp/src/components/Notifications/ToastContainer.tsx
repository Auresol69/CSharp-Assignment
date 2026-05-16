import React, { useState, useCallback } from 'react';
import Toast from './Toast';
import type { NotificationData } from '../../context/NotificationContext';

interface ToastWithIdProps extends NotificationData {
  toastId: string;
}

interface ToastContainerProps {
  notifications: NotificationData[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ notifications }) => {
  const [toasts, setToasts] = useState<Map<string, ToastWithIdProps>>(new Map());

  // Thêm notification mới vào toasts
  React.useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const toastId = latestNotification.id || `${Date.now()}-${Math.random()}`;

      setToasts((prev) => {
        const newToasts = new Map(prev);
        newToasts.set(toastId, {
          ...latestNotification,
          toastId,
        });
        return newToasts;
      });
    }
  }, [notifications]);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => {
      const newToasts = new Map(prev);
      newToasts.delete(toastId);
      return newToasts;
    });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-auto">
      <div className="space-y-3">
        {Array.from(toasts.values())
          .slice(0, 5) // Tối đa 5 toasts hiển thị cùng lúc
          .map((toast) => (
            <Toast
              key={toast.toastId}
              notification={toast}
              onRemove={removeToast}
              autoClose={5000}
            />
          ))}
      </div>
    </div>
  );
};

export default ToastContainer;
