export interface IPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  content: string;
  mediaUrl?: string;
  // Thêm dòng này cho bài đăng được share 
  sharedPost?: IPost; 
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}