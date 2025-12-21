import { createContext } from 'react';
import type { UserDTO } from 'shared/application/dtos';

export interface AuthContextValue {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: UserDTO, rememberMe: boolean) => void;
  logout: () => Promise<void>;
  sessionToken: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
