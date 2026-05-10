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

export async function getNotifications() {
  try {
    const res = await api.get<INotificationResponseDto[]>('/notification');
    return res.data;
  } catch (error) {
    return [];
  }
}
