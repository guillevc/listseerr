/**
 * Auth Command DTOs (Input)
 *
 * These represent the input data for each auth use case.
 * They contain only primitives - no Value Objects or Entities.
 */

import type {
  UsernamePrimitive,
  PasswordPrimitive,
  SessionTokenPrimitive,
  RegisterUserPrimitive,
  LoginUserPrimitive,
  UpdateUserCredentialsPrimitive,
} from 'shared/domain/types/auth.types';

/**
 * RegisterUserCommand
 * Extends RegisterUserPrimitive but excludes confirmPassword
 * (password matching is validated at schema level, not stored)
 */
export interface RegisterUserCommand extends Omit<RegisterUserPrimitive, 'confirmPassword'> {
  username: UsernamePrimitive;
  password: PasswordPrimitive;
}

/**
 * LoginUserCommand
 * Contains credentials for authentication
 */
export interface LoginUserCommand extends LoginUserPrimitive {
  username: UsernamePrimitive;
  password: PasswordPrimitive;
  rememberMe: boolean;
}

/**
 * ValidateSessionCommand
 * Used to validate an existing session
 */
export interface ValidateSessionCommand {
  token: SessionTokenPrimitive;
}

/**
 * LogoutSessionCommand
 * Used to invalidate a session
 */
export interface LogoutSessionCommand {
  token: SessionTokenPrimitive;
}

/**
 * UpdateUserCredentialsCommand
 * Used to update user's username and/or password
 */
export interface UpdateUserCredentialsCommand extends UpdateUserCredentialsPrimitive {
  userId: number;
}
