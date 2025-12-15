import { useState, useEffect, useRef } from 'react';

const DEFAULT_MIN_MS = 400;

export function useMinLoading(isLoading: boolean, minMs = DEFAULT_MIN_MS): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const loadingStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading - record when it started
      loadingStartRef.current = Date.now();
      setShowLoading(true);
    } else if (loadingStartRef.current !== null) {
      // Loading finished - calculate remaining time
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = minMs - elapsed;

      if (remaining > 0) {
        // Keep showing loading for remaining time
        const timeout = setTimeout(() => {
          setShowLoading(false);
          loadingStartRef.current = null;
        }, remaining);
        return () => clearTimeout(timeout);
      } else {
        // Minimum time already passed
        setShowLoading(false);
        loadingStartRef.current = null;
      }
    }
  }, [isLoading, minMs]);

  return showLoading;
}
