'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
}

export default function ClientOnlyWrapper({ children }: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Always render the children to prevent hydration mismatch
  // But only apply client-side logic after mount
  return (
    <div suppressHydrationWarning={true}>
      {hasMounted ? children : children}
    </div>
  );
}
