export interface IReportedPostSummary {
  postId: string;
  content?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  reportCount: number;
  isBlacklisted: boolean;
}

export interface IPostReportDetail {
  reportId: string;
  postId?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterAvatarUrl?: string | null;
  reason?: string | null;
}