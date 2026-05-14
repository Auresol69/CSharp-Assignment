import { useEffect, useState, useCallback } from 'react';
import type { IPost } from '../types/Post';
import * as postsApi from '../services/api/postsApi';

export default function useFeed(initialLoad = true, pageSize = 10) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextTimestamp, setNextTimestamp] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const load = useCallback(async (refresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { posts: fetched, nextTimestamp: next, hasMore: more } = await postsApi.getFeed(refresh ? null : nextTimestamp, pageSize);
      setPosts((prev) => refresh ? fetched : [...prev, ...fetched]);
      setNextTimestamp(next ?? null);
      setHasMore(!!more);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Lỗi khi tải feed');
    } finally {
      setLoading(false);
    }
  }, [nextTimestamp, pageSize, loading]);

  useEffect(() => {
    if (!initialLoad) return;
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    load,
    refresh: () => load(true),
  };
}
