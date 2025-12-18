/**
 * Auth Types
 *
 * Pure TypeScript contracts for authentication-related data.
 * Schemas must satisfy these types.
 */

// Branded primitives
export type UsernamePrimitive = string;
export type PasswordPrimitive = string;
export type SessionTokenPrimitive = string;

// Composite primitives (used by DTOs and schemas)
export interface RegisterUserPrimitive {
  username: UsernamePrimitive;
  password: PasswordPrimitive;
  confirmPassword: PasswordPrimitive;
}

export interface LoginUserPrimitive {
  username: UsernamePrimitive;
  password: PasswordPrimitive;
  rememberMe: boolean;
}
