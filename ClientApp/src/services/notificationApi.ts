import api from './api';

export interface INotificationResponseDto {
  idNotification: string;
  idPost?: string | null;
  type?: string | null;
  isRead: boolean;
  triggeredByUserName?: string | null;
  triggeredByAvatarUrl?: string | null;
  message?: string | null;
}

export async function getNotifications(take = 100) {
  try {
    const res = await api.get<INotificationResponseDto[]>('/notification', { params: { take } });
    return res.data;
  } catch (error) {
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  const res = await api.patch<{ message: string }>(`/notification/${notificationId}/read`);
  return res.data;
}

export async function markAllAsRead() {
  const res = await api.patch<{ message: string; updatedCount: number }>('/notification/read-all');
  return res.data;
}

export async function deleteNotification(notificationId: string) {
  const res = await api.delete<{ message: string }>(`/notification/${notificationId}`);
  return res.data;
}
