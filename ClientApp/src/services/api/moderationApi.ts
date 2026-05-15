import api from "./index";
import type { IPostReportDetail, IReportedPostSummary } from "../../types/Moderation";

export const getReportedPosts = async () => {
  const response = await api.get<IReportedPostSummary[]>("/admin/moderation/reported-posts");

  return response.data;
};

export const getReportsByPost = async (postId: string) => {
  const response = await api.get<IPostReportDetail[]>(`/admin/moderation/posts/${postId}/reports`);

  return response.data;
};

export const removeFromBlacklist = async (postId: string) => {
  const response = await api.delete(`/admin/moderation/posts/${postId}/blacklist`);

  return response.data as { message?: string };
};

export const approveAndDeletePost = async (postId: string) => {
  const response = await api.post(`/admin/moderation/posts/${postId}/approve`, {});

  return response.data as { message: string };
};

export const clearReports = async (postId: string) => {
  const response = await api.delete(`/admin/moderation/posts/${postId}/reports`);

  return response.data as { message: string };
};
