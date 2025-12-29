import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SerializedUser } from 'shared/application/dtos';
import { trpc } from '@/client/lib/trpc';
import { AuthContext, type AuthContextValue } from './auth-context-value';

const SESSION_COOKIE_NAME = 'session_token';

// Cookie helpers
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

function setCookie(name: string, value: string, days?: number): void {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SerializedUser | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    getCookie(SESSION_COOKIE_NAME)
  );
  const [isLoading, setIsLoading] = useState(true);

  const logoutMutation = trpc.auth.logout.useMutation();
  const validateSessionQuery = trpc.auth.validateSession.useQuery(
    { token: sessionToken ?? '' },
    {
      enabled: !!sessionToken,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Handle validation result
  useEffect(() => {
    if (!sessionToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (validateSessionQuery.isLoading) {
      return;
    }

    if (validateSessionQuery.data?.valid && validateSessionQuery.data.user) {
      setUser(validateSessionQuery.data.user);
    } else if (validateSessionQuery.isError || !validateSessionQuery.data?.valid) {
      // Invalid session, clear it
      deleteCookie(SESSION_COOKIE_NAME);
      setSessionToken(null);
      setUser(null);
    }

    setIsLoading(false);
  }, [
    sessionToken,
    validateSessionQuery.isLoading,
    validateSessionQuery.data,
    validateSessionQuery.isError,
  ]);

  const login = useCallback((token: string, userData: SerializedUser, rememberMe: boolean) => {
    // Set cookie - if rememberMe, set for 100 years, otherwise session cookie
    if (rememberMe) {
      setCookie(SESSION_COOKIE_NAME, token, 36500); // ~100 years
    } else {
      setCookie(SESSION_COOKIE_NAME, token); // Session cookie (expires when browser closes)
    }
    setSessionToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await logoutMutation.mutateAsync({ token: sessionToken });
      } catch {
        // Ignore errors on logout - still clear local state
      }
    }
    deleteCookie(SESSION_COOKIE_NAME);
    setSessionToken(null);
    setUser(null);
  }, [sessionToken, logoutMutation]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    sessionToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
