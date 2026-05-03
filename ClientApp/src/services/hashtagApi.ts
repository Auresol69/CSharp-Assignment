import api from './api';

export async function getTrendingHashtags(filterType = 'daily', take = 10) {
  const res = await api.get('/hashtag/trending', { params: { filterType, take } });
  return res.data.data as string[];
}

export async function getPostsByHashtag(hashtag: string, lastTimestamp?: string | null, take = 10) {
  const params: Record<string, any> = { take };
  if (lastTimestamp) params.lastTimestamp = lastTimestamp;
  const res = await api.get(`/hashtag/${encodeURIComponent(hashtag)}/posts`, { params });
  return res.data;
}
