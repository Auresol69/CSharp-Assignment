import api from './index';
import type { IPostResponseDto } from '../../types/Post';
import type { IPost } from '../../types/Post';

function mapPostDtoToIPost(dto: IPostResponseDto): IPost {
  return {
    id: dto.idPost,
    authorId: dto.taiKhoan?.id ?? '',
    authorName: dto.taiKhoan?.tenTaiKhoan ?? 'Unknown',
    authorAvatar: dto.taiKhoan?.avatarUrl ?? '',
    createdAt: dto.createdAt,
    content: dto.content,
    mediaUrl: dto.media && dto.media.length > 0 ? dto.media[0].url : undefined,
    sharedPost: undefined,
    likesCount: dto.likesCount,
    commentsCount: dto.commentsCount,
    sharesCount: dto.repostsCount ?? 0,
  };
}

export async function getFeed(lastTimestamp?: string | null, limit = 10) {
  const params: Record<string, any> = { limit };
  if (lastTimestamp) params.lastTimestamp = lastTimestamp;

  const res = await api.get('/post/feed', { params });
  const data = res.data;
  const posts: IPost[] = (data.data as IPostResponseDto[]).map(mapPostDtoToIPost);
  return {
    posts,
    nextTimestamp: data.nextTimestamp as string | null,
    hasMore: !!data.hasMore,
  };
}

export async function getPostById(postId: string) {
  const res = await api.get(`/post/${postId}`);
  return res.data as IPostResponseDto;
}

export async function createPost(formData: FormData) {
  const res = await api.post('/post', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data as IPostResponseDto;
}

export async function deletePost(postId: string) {
  await api.delete(`/post/${postId}`);
}

export async function repostPost(postId: string, content?: string) {
  const res = await api.post(`/post/${postId}/repost`, { content });
  return res.data as IPostResponseDto;
}

export async function reportPost(postId: string, reason: string) {
  const res = await api.post(`/post/${postId}/report`, { reason });
  return res.data;
}

