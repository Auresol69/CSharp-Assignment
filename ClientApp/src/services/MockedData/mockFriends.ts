// src/services/MockedData/mockFriends.ts
import type { IFriend } from "../../types/Friends"; // Giả sử ông giáo đặt interface ở đây

export const MOCK_FRIENDS: IFriend[] = [
  { id: 'f1', name: 'Nguyễn Thanh Tùng', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tung', type: 'friend' },
  { id: 'f2', name: 'Hoàng Yến Nhi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nhi', type: 'friend' },
  { id: 'f3', name: 'Lê Minh Triết', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Triet', type: 'friend' },
  { id: 'f4', name: 'Phạm Bảo Châu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chau', type: 'friend' },
  { id: 'f5', name: 'Đặng Tuấn Kiệt', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kiet', type: 'friend' },
];