import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const YOUTUBE_URL_PATTERN =
  /(?:youtu\.be\/|youtube(?:-nocookie|education)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//i;

export const useVideoPlayer = (url?: string) => {
  const { ref, inView } = useInView({ threshold: 0.6 });
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (inView) {
      timer = setTimeout(() => setShouldPlay(true), 150);
    } else {
      setShouldPlay(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [inView]);

  const isYouTube = !!url && YOUTUBE_URL_PATTERN.test(url);

  return { ref, shouldPlay, isYouTube, url };
};
