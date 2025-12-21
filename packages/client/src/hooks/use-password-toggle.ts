import { useState, useCallback } from 'react';

interface UsePasswordToggleReturn {
  /** Whether the password is currently visible */
  isVisible: boolean;
  /** Toggle the password visibility */
  toggle: () => void;
  /** Set visibility to a specific value */
  setVisible: (visible: boolean) => void;
  /** Input type based on visibility state */
  inputType: 'text' | 'password';
}

/**
 * Hook to manage password/secret visibility toggle state.
 * Used for API keys, passwords, and other sensitive inputs.
 */
export function usePasswordToggle(initialVisible = false): UsePasswordToggleReturn {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    setIsVisible(visible);
  }, []);

  return {
    isVisible,
    toggle,
    setVisible,
    inputType: isVisible ? 'text' : 'password',
  };
}
