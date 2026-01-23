/**
 * Auth Command DTOs (Input)
 *
 * These represent the input data for each auth use case.
 * They contain only primitives - no Value Objects or Entities.
 */

import type {
  SessionTokenPrimitive,
  RegisterUserPrimitive,
  LoginUserPrimitive,
  UpdateUserCredentialsPrimitive,
} from 'shared/domain/types';

/**
 * RegisterUserCommand
 * Extends RegisterUserPrimitive but excludes confirmPassword
 * (password matching is validated at schema level, not stored)
 */
export type RegisterUserCommand = Omit<RegisterUserPrimitive, 'confirmPassword'>;

/**
 * LoginUserCommand
 * Contains credentials for authentication
 */
export type LoginUserCommand = LoginUserPrimitive;

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
