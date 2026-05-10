import api from './api';
import type { ICommentResponseDto } from '../types/Post';

export async function getCommentsByPost(postId: string) {
  const res = await api.get(`/comment/post/${postId}`);
  // returns { postId, data }
  return res.data.data as ICommentResponseDto[];
}

export async function createComment(postId: string, content: string) {
  const res = await api.post('/comment', { idPost: postId, content });
  return res.data as { idComment: string; content: string; idPost: string };
}

export async function replyToComment(parentCommentId: string, postId: string, content: string) {
  const res = await api.post(`/comment/${parentCommentId}/reply`, { idPost: postId, content });
  return res.data as { idComment: string; content: string; parentCommentId: string };
}
