/**
 * Application DTOs
 *
 * Data Transfer Objects for use case commands and responses.
 */

// Core DTOs (entity representations)
export * from './core';

// Feature-specific DTOs (commands and responses)
export * from './auth';
export * from './dashboard';
export * from './diagnostics';
export * from './general-settings';
export * from './jellyseerr-config';
export * from './logs';
export * from './mdblist-config';
export * from './media-list';
export * from './processing';
export * from './scheduler';
export * from './trakt-config';

// Utility types
export * from './utils.dto';
