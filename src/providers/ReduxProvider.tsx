'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { CircularProgress, Box } from '@mui/material';
import { useEffect, useState } from 'react';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial client render, don't use persistor to prevent hydration mismatch
  if (!isClient || !persistor) {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }

  // After hydration, use PersistGate
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <CircularProgress />
          </Box>
        }
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
