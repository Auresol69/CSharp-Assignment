import api from './index';
import type { ICommentResponseDto } from '../../types/Post';

export async function getCommentsByPost(postId: string) {
  const res = await api.get(`/comments/post/${postId}`);
  // returns { postId, data }
  return res.data.data as ICommentResponseDto[];
}

export async function createComment(postId: string, content: string) {
  const res = await api.post('/comments', { idPost: postId, content });
  return res.data as { idComment: string; content: string; idPost: string };
}

export async function replyToComment(parentCommentId: string, postId: string, content: string) {
  const res = await api.post(`/comments/${parentCommentId}/reply`, { idPost: postId, content });
  return res.data as { idComment: string; content: string; parentCommentId: string };
}

