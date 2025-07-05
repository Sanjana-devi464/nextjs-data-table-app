'use client';

import { useMemo, useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getTheme } from '@/theme';

interface MuiThemeProviderProps {
  children: React.ReactNode;
}

export default function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  const themeMode = useSelector((state: RootState) => state.ui.theme);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Always use light theme during SSR and initial render to prevent hydration mismatch
  const theme = useMemo(() => {
    const actualTheme = isHydrated ? themeMode : 'light';
    return getTheme(actualTheme);
  }, [isHydrated, themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
