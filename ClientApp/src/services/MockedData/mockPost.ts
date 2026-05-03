import type { IPost } from '../../types/Post';

export const MOCK_POSTS: IPost[] = [
  // 1. TRƯỜNG HỢP: BÀI VIẾT ĐẦY ĐỦ (TEXT + HASHTAG + IMAGE)
  {
    id: '1',
    authorId: 'user-1',
    authorName: 'Nguyễn Văn A',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    createdAt: '12 giờ trước',
    content: 'Hôm nay vừa hoàn thiện xong phần giao diện cho dự án InteractHub! 🚀 Mọi người thấy sao về cái Card bài đăng này? Hy vọng sẽ kịp deadline ngày 19/4. \n#SGU #SoftwareDevelopment #InteractHub #ReactJS',
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
    likesCount: 128,
    commentsCount: 24,
    sharesCount: 5,
  },

  // 2. TRƯỜNG HỢP: CHỈ CÓ TEXT (KIỂM TRA BỐ CỤC KHI KHÔNG CÓ MEDIA)
  {
    id: '2',
    authorId: 'user-2',
    authorName: 'Lê Thị Hoa',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    createdAt: '2 giờ trước',
    content: 'Có ai biết quán cafe nào yên tĩnh quanh khu vực Quận 5 để học nhóm không ạ? Sắp tới thi cuối kỳ rồi, cần tìm nơi tập trung cao độ. 📚☕',
    likesCount: 45,
    commentsCount: 12,
    sharesCount: 0,
  },

  // 3. TRƯỜNG HỢP: VIDEO MP4 TRỰC TIẾP (KIỂM TRA VIDEO PLAYER)
  {
    id: '3',
    authorId: 'user-3',
    authorName: 'Trần Minh Tuấn',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SGU_Student',
    createdAt: 'Vừa xong',
    content: 'Test thử tính năng tự động phát video trên bản tin. Phê chữ ê kéo dài! 🎥✨ #CodingNight #Vibe',
    mediaUrl: 'https://vjs.zencdn.net/v/oceans.mp4', 
    likesCount: 312,
    commentsCount: 56,
    sharesCount: 89,
  },

  // 4. TRƯỜNG HỢP: CHIA SẺ BÀI VIẾT (SHARED POST - 1 CẤP)
  {
    id: '5',
    authorId: 'user-5',
    authorName: 'Lâm Đẹp Trai',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lam',
    createdAt: '5 phút trước',
    content: 'Thông tin cực kỳ hữu ích cho anh em SGU nè! Đăng ký ngay kẻo lỡ học phần. #SGU #News',
    likesCount: 10,
    commentsCount: 2,
    sharesCount: 0,
    sharedPost: {
      id: '4',
      authorId: 'user-4',
      authorName: 'Đại học Sài Gòn (SGU)',
      authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=SGU',
      createdAt: '5 giờ trước',
      content: 'Thông báo về việc đăng ký học phần bổ sung cho học kỳ tới. Sinh viên lưu ý kiểm tra lịch trên hệ thống nhé! #SGU #Registration',
      likesCount: 1024,
      commentsCount: 450,
      sharesCount: 230,
    }
  },

  // 5. TRƯỜNG HỢP: LINK YOUTUBE (KIỂM TRA REACTPLAYER VỚI YOUTUBE)
  {
    id: '9',
    authorId: 'user-9',
    authorName: 'Đặng Minh Hoàng',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang',
    createdAt: '1 phút trước',
    content: 'Video này cuốn thực sự, xem đi xem lại không chán luôn á! 😂',
    likesCount: 15,
    commentsCount: 3,
    sharesCount: 1,
    sharedPost: {
      id: 'yt-rickroll',
      authorId: 'user-rick',
      authorName: 'Rick Astley',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rick',
      createdAt: '25 tháng 10, 2009',
      content: 'Never Gonna Give You Up (Official Music Video)',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
      likesCount: 17000000,
      commentsCount: 2000000,
      sharesCount: 5000000,
    }
  },

  // 6. TRƯỜNG HỢP: CONTENT QUÁ DÀI (KIỂM TRA HIỂN THỊ TRUNCATE/CUỘN)
  {
    id: '10',
    authorId: 'user-10',
    authorName: 'Hội Cuồng Code',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Code',
    createdAt: '3 giờ trước',
    content: 'Lập trình viên không phải là những cỗ máy viết code, chúng ta là những người giải quyết vấn đề. \n'.repeat(10) + '\n#DeepThinking #Developer',
    likesCount: 500,
    commentsCount: 100,
    sharesCount: 50,
  },

  // 7. TRƯỜNG HỢP: CHIA SẺ BÀI VIẾT NHƯNG BÀI GỐC CÓ MEDIA (ẢNH)
  {
    id: '11',
    authorId: 'user-11',
    authorName: 'Trần Thị B',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B',
    createdAt: '10 phút trước',
    content: 'Nhìn cái setup này thèm quá, bao giờ mới có tiền mua đây... 💻🔥',
    likesCount: 20,
    commentsCount: 5,
    sharesCount: 2,
    sharedPost: {
      id: '12',
      authorId: 'user-12',
      authorName: 'Setup Inspiration',
      authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Setup',
      createdAt: '1 ngày trước',
      content: 'Một góc làm việc tối giản cho Developer. #Minimalism #Setup',
      mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop',
      likesCount: 5000,
      commentsCount: 200,
      sharesCount: 1200,
    }
  },

  // 8. TRƯỜNG HỢP: HASHTAG TRÙNG LẶP & KÝ TỰ ĐẶC BIỆT
  {
    id: '13',
    authorId: 'user-13',
    authorName: 'Hacker lỏ',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hacker',
    createdAt: 'Vừa xong',
    content: 'Thử nghiệm hashtag lồng nhau nè: #SGU #SGU_IT #sgu #InteractHub_2026. Có nhận diện được hết không? 😎',
    likesCount: 1,
    commentsCount: 0,
    sharesCount: 0,
  }
];