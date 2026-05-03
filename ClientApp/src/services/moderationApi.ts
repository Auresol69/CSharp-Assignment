import api from "./api";
import type { IPostReportDetail, IReportedPostSummary } from "../types/Moderation";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken") ?? localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getReportedPosts = async () => {
  const response = await api.get<IReportedPostSummary[]>("/admin/moderation/reported-posts", {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getReportsByPost = async (postId: string) => {
  const response = await api.get<IPostReportDetail[]>(`/admin/moderation/posts/${postId}/reports`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const removeFromBlacklist = async (postId: string) => {
  const response = await api.delete(`/admin/moderation/posts/${postId}/blacklist`, {
    headers: getAuthHeaders(),
  });

  return response.data as { message?: string };
};