export type NotificationType = 'like' | 'comment' | 'follow';

export interface INotification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  isRead: boolean;
  targetImage?: string;
}

export interface ITabsProps {
  filter: 'all' | 'unread';
  setFilter: (filter: 'all' | 'unread') => void;
}