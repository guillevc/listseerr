import { DomainError } from './domain.error';

/**
 * Invalid Credentials Error
 *
 * Thrown when login credentials (username/password) are incorrect.
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS_ERROR' as const;

  constructor() {
    super('Invalid username or password');
  }
}

/**
 * User Already Exists Error
 *
 * Thrown when attempting to register with a username that's already taken.
 */
export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS_ERROR' as const;

  constructor(username: string) {
    super(`User "${username}" already exists`);
  }
}

/**
 * Session Not Found Error
 *
 * Thrown when a session token is invalid or expired.
 */
export class SessionNotFoundError extends DomainError {
  readonly code = 'SESSION_NOT_FOUND_ERROR' as const;

  constructor() {
    super('Session not found or expired');
  }
}

/**
 * User Not Found Error
 *
 * Thrown when a user cannot be found by ID.
 */
export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND_ERROR' as const;

  constructor(userId: number) {
    super(`User with ID ${userId} not found`);
  }
}

/**
 * Invalid Username Error
 *
 * Thrown when a username doesn't meet validation requirements.
 */
export class InvalidUsernameError extends DomainError {
  readonly code = 'INVALID_USERNAME_ERROR' as const;

  constructor(reason: string) {
    super(`Invalid username: ${reason}`);
  }
}

/**
 * Invalid Password Error
 *
 * Thrown when a password doesn't meet validation requirements.
 */
export class InvalidPasswordError extends DomainError {
  readonly code = 'INVALID_PASSWORD_ERROR' as const;

  constructor(reason: string) {
    super(`Invalid password: ${reason}`);
  }
}

/**
 * Invalid Session Token Error
 *
 * Thrown when a session token has an invalid format.
 */
export class InvalidSessionTokenError extends DomainError {
  readonly code = 'INVALID_SESSION_TOKEN_ERROR' as const;

  constructor() {
    super('Invalid session token format');
  }
}

/**
 * Registration Disabled Error
 *
 * Thrown when registration is attempted but a user already exists.
 */
export class RegistrationDisabledError extends DomainError {
  readonly code = 'REGISTRATION_DISABLED_ERROR' as const;

  constructor() {
    super('Registration is disabled - a user account already exists');
  }
}
