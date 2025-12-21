import type { UserDTO } from '../core/user.dto';
import type { SessionTokenPrimitive } from 'shared/domain/types';

/**
 * Auth Response DTOs (Output)
 *
 * These represent the output data from auth use cases.
 * They contain only primitives - Value Objects are unwrapped to their raw values.
 * This makes them serializable and framework-agnostic.
 */

/**
 * CheckSetupStatusResponse
 * Returns whether the application needs initial setup (no users exist)
 */
export interface CheckSetupStatusResponse {
  needsSetup: boolean;
}

/**
 * RegisterUserResponse
 * Returns the newly created user and session token
 */
export interface RegisterUserResponse {
  user: UserDTO;
  token: SessionTokenPrimitive;
}

/**
 * LoginUserResponse
 * Returns the authenticated user and session token
 */
export interface LoginUserResponse {
  user: UserDTO;
  token: SessionTokenPrimitive;
}

/**
 * ValidateSessionResponse
 * Returns the user if session is valid
 */
export interface ValidateSessionResponse {
  user: UserDTO | null;
  valid: boolean;
}

/**
 * LogoutSessionResponse
 * Returns success status
 */
export interface LogoutSessionResponse {
  success: boolean;
}

/**
 * UpdateUserCredentialsResponse
 * Returns the updated user
 */
export interface UpdateUserCredentialsResponse {
  user: UserDTO;
}
