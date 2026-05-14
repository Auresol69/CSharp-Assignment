import { useEffect, useState } from 'react';
import { getLocalStories } from '../services/api/storyApi';
import type { IStoryResponseDto } from '../types/Post';

export interface UserStory {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: { id: string; url: string }[];
}

function groupStoriesByUser(stories: IStoryResponseDto[]): UserStory[] {
  const map = new Map<string, UserStory>();

  for (const s of stories) {
    const userId = s.taiKhoan?.id ?? 'unknown';
    if (!map.has(userId)) {
      map.set(userId, {
        userId,
        userName: s.taiKhoan?.tenTaiKhoan ?? 'Unknown',
        userAvatar: s.taiKhoan?.avatarUrl ?? '',
        stories: [],
      });
    }
    map.get(userId)!.stories.push({
      id: s.idStory,
      url: s.mediaUrl ?? '',
    });
  }

  return Array.from(map.values());
}

export default function useStories(take = 20) {
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLocalStories(take)
      .then(list => {
        if (mounted) setUserStories(groupStoriesByUser(list));
      })
      .catch(() => {
        // Giữ rỗng nếu lỗi (không hiện mock)
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [take]);

  return { userStories, loading };
}

