'use client';

import { CacheProvider } from '@emotion/react';
import createEmotionCache from '@/utils/createEmotionCache';
import { useEffect, useState } from 'react';

interface EmotionProviderProps {
  children: React.ReactNode;
}

// Client-side cache, create it once.
const clientSideEmotionCache = createEmotionCache();

export default function EmotionProvider({ children }: EmotionProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR, don't use CacheProvider to prevent hydration mismatch
  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <CacheProvider value={clientSideEmotionCache}>
      {children}
    </CacheProvider>
  );
}
