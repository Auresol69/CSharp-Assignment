import { useEffect, useState } from 'react';
import * as commentsApi from '../services/commentsApi';
import type { ICommentResponseDto } from '../types/Post';

export default function useCommentsByPost(postId?: string) {
  const [comments, setComments] = useState<ICommentResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!postId) return;
    setLoading(true);
    commentsApi.getCommentsByPost(postId)
      .then(list => { if (mounted) setComments(list); })
      .catch(e => { if (mounted) setError(e?.message ?? 'Lỗi'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [postId]);

  return { comments, loading, error };
}
