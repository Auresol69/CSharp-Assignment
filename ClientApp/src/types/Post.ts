// Backend DTO interfaces (match API responses)
export interface IUserResponseDto {
  id: string;
  tenTaiKhoan: string;
  avatarUrl?: string | null;
}

export interface IPostMediaDto {
  id: number;
  url: string;
  mediaType: string;
}

export interface IPostResponseDto {
  idPost: string;
  content: string;
  createdAt: string; // ISO datetime
  parentPostId?: string | null;
  taiKhoan?: IUserResponseDto | null;
  media: IPostMediaDto[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
}

export interface ICommentResponseDto {
  idComment: string;
  content: string;
  createdAt: string;
  parentCommentId?: string | null;
  taiKhoan?: IUserResponseDto | null;
  replies?: ICommentResponseDto[];
}

export interface IPostDetailResponseDto extends IPostResponseDto {
  comments: ICommentResponseDto[];
}

export interface IStoryResponseDto {
  idStory: string;
  caption?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  taiKhoan?: IUserResponseDto | null;
}

// UI-friendly types (camelCase & simplified for components)
export interface IPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  content: string;
  mediaUrl?: string;
  sharedPost?: IPost;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}