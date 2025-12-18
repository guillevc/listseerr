/**
 * Auth Logic Functions
 *
 * Pure functions for authentication-related display and utility behavior.
 * These are shared between the frontend and server (DRY principle).
 */

/**
 * Session duration in milliseconds for non-"remember me" sessions.
 * Default: 24 hours
 */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Far future date for "remember me" sessions.
 * Using a far-future date instead of null avoids SQLite null handling issues
 * in WHERE expires_at > NOW() queries.
 * Default: 100 years from now
 */
const FAR_FUTURE_YEARS = 100;

/**
 * Gets the session expiry date based on "remember me" preference.
 *
 * @param rememberMe - If true, returns a date 100 years in the future (effectively never expires).
 *                     If false, returns a date 24 hours from now.
 * @returns The session expiry date
 */
export function getSessionExpiryDate(rememberMe: boolean): Date {
  const now = new Date();

  if (rememberMe) {
    // Far future date (100 years)
    return new Date(now.getFullYear() + FAR_FUTURE_YEARS, now.getMonth(), now.getDate());
  }

  // 24 hours from now
  return new Date(now.getTime() + SESSION_DURATION_MS);
}

/**
 * Checks if a session is expired.
 *
 * @param expiresAt - The session expiry date
 * @returns true if the session has expired, false otherwise
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
