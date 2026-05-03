import api from './api';

export interface AddCommentRequest {
  idPost: string;
  content: string;
}

export interface AddLikeRequest {
  idPost: string;
}

export async function addComment(request: AddCommentRequest) {
  const res = await api.post('/interaction/AddComment', request);
  return res.data;
}

export async function addLike(request: AddLikeRequest) {
  const res = await api.post('/interaction/AddLike', request);
  return res.data;
}
