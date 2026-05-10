export interface IFriend {
  id?: string;
  userId?: string;
  name: string;
  avatar: string;
  type: 'friend' | 'request' | 'suggest';
  mutualFriends?: number; // Dấu ? nghĩa là có thể có hoặc không
}
