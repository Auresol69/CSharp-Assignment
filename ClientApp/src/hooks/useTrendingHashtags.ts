import { useEffect, useState } from 'react';
import * as hashtagApi from '../services/api/hashtagApi';

export default function useTrendingHashtags(filterType = 'daily', take = 10) {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    hashtagApi.getTrendingHashtags(filterType, take)
      .then(list => { if (mounted) setData(list); })
      .catch(e => { if (mounted) setError(e?.message ?? 'Lỗi'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [filterType, take]);

  return { data, loading, error };
}

