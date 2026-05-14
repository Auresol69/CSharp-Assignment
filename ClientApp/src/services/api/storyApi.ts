import api from './index';
import type { IStoryResponseDto } from '../../types/Post';

export async function getGlobalStories(take = 20) {
  const res = await api.get('/story/global', { params: { take } });
  return res.data.data as IStoryResponseDto[];
}

export async function getLocalStories(take = 20) {
  const res = await api.get('/story/local', { params: { take } });
  return res.data.data as IStoryResponseDto[];
}

export async function createStory(formData: FormData) {
  const res = await api.post('/story', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data as { idStory: string; caption: string; mediaUrl: string; expiresAt: string };
}

export async function deleteStory(storyId: string) {
  await api.delete(`/story/${storyId}`);
}

