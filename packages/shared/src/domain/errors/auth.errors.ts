import { DomainError } from './domain.error';

/**
 * Invalid Credentials Error
 *
 * Thrown when login credentials (username/password) are incorrect.
 */
export class InvalidCredentialsError extends DomainError {
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
  constructor() {
    super('Invalid session token format');
  }
}
