'use client';

import { useIsClient } from '@/hooks/useSSR';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
