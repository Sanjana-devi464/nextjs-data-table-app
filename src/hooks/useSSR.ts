import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if the component is hydrated on the client side
 * Helps prevent hydration mismatches in SSR applications
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Custom hook to detect if the component is mounted and hydrated
 * More robust than useIsClient for preventing hydration mismatches
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
}

/**
 * Custom hook to safely access localStorage with SSR
 * Returns null during SSR and actual value on client side
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const isClient = useIsClient();
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key, isClient]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Custom hook to prevent hydration mismatches
 * Returns null during SSR and hydration, actual value after hydration
 */
export function useHydrationSafeState<T>(
  initialValue: T
): [T | null, (value: T) => void] {
  const isClient = useIsClient();
  const [value, setValue] = useState<T | null>(isClient ? initialValue : null);

  useEffect(() => {
    if (isClient && value === null) {
      setValue(initialValue);
    }
  }, [isClient, initialValue, value]);

  return [value, setValue];
}

/**
 * Custom hook to safely access browser APIs
 * Returns null during SSR and actual value on client side
 */
export function useBrowserOnly<T>(getValue: () => T): T | null {
  const isClient = useIsClient();
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    if (isClient) {
      try {
        setValue(getValue());
      } catch (error) {
        console.error('Error accessing browser API:', error);
      }
    }
  }, [isClient, getValue]);

  return value;
}
