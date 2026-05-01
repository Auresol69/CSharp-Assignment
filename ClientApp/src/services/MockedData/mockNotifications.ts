import type { INotification } from "../../types/Notifications";

export const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?u=a",
    },
    content: "đã thích bài viết của bạn",
    time: "2 phút trước",
    isRead: false,
    targetImage: "https://picsum.photos/200/200?random=1",
    // Chuyển hướng đến trang chi tiết bài viết
    targetUrl: "/post/101", 
  },
  {
    id: "2",
    type: "comment",
    user: {
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?u=b",
    },
    content: "đã bình luận: 'Bài viết hay quá bạn ơi!'",
    time: "15 phút trước",
    isRead: false,
    targetImage: "https://picsum.photos/200/200?random=2",
    // Chuyển hướng và focus vào ID của bình luận cụ thể
    targetUrl: "/post/101#comment-202", 
  },
  {
    id: "3",
    type: "follow",
    user: {
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?u=c",
    },
    content: "đã bắt đầu theo dõi bạn",
    time: "1 giờ trước",
    isRead: true,
    // Follow thường chuyển hướng về trang cá nhân của người đó
    targetUrl: "/profile/le-van-c", 
  },
  {
    id: "4",
    type: "report",
    user: {
      name: "Hệ thống kiểm duyệt",
      avatar: "https://cdn-icons-png.flaticon.com/512/1022/1022382.png",
    },
    content: "Nội dung phản cảm trong bài viết 'Mẹo học React'",
    time: "3 giờ trước",
    isRead: false,
    targetImage: "https://picsum.photos/200/200?random=3",
    // Admin click vào sẽ nhảy thẳng đến bài viết bị báo cáo để xử lý
    targetUrl: "/post/105#report-context", 
  },
  {
    id: "5",
    type: "comment",
    user: {
      name: "Phạm Minh D",
      avatar: "https://i.pravatar.cc/150?u=d",
    },
    content: "đã nhắc đến bạn trong một bình luận",
    time: "5 giờ trước",
    isRead: true,
    targetUrl: "/post/108#comment-505",
  }
];