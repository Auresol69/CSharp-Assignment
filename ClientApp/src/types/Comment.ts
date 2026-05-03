export interface IComment {
  id: string;
  userName: string;
  content: string;
  avatar?: string;
  replies?: IComment[]; // Đệ quy: một bình luận chứa danh sách bình luận con
}

export interface CommentItemProps {
  comment: IComment;
  isReply?: boolean;
}