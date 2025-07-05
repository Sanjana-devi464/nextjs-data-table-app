import { useEffect, useState } from 'react';

/**
 * Hook to prevent hydration mismatches by ensuring components
 * only render after the client has mounted
 */
export function useHydrationFix() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

/**
 * Wrapper component that only renders children after hydration
 * to prevent hydration mismatches
 */
interface NoSSRProps {
  children: React.ReactNode;
}

export function NoSSR({ children }: NoSSRProps) {
  const hasMounted = useHydrationFix();

  if (!hasMounted) {
    return null;
  }

  return children;
}
