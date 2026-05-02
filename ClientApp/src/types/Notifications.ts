export type NotificationType = 'like' | 'comment' | 'follow' | 'report';

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
  targetUrl?: string; // URL kèm hash ID (vd: /post/1#comment-123)
}

export interface ITabsProps {
  filter: 'all' | 'unread' | 'moderation';
  setFilter: (filter: 'all' | 'unread' | 'moderation') => void;
  showModeration: boolean;
}