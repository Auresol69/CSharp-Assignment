import type { INotification } from "../../types/Notifications";

export const MOCK_NOTIFICATIONS: INotification[] = [
  {
      id: '1', 
      type: 'like', 
      user: { name: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' }, 
      content: 'đã thích bài viết của bạn.', 
      time: '2 phút trước', 
      isRead: false, 
      targetImage: 'https://picsum.photos/id/10/50/50'
  },
  {
      id: '2', 
      type: 'comment', 
      user: { name: 'Lê Thị B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' }, 
      content: 'đã bình luận: "Đỉnh quá!"', 
      time: '1 giờ trước', 
      isRead: false, 
      targetImage: 'https://picsum.photos/id/20/50/50'
  },
];