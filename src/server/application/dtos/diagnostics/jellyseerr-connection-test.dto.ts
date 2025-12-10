/**
 * Diagnostics DTOs
 *
 * These DTOs are for cross-domain diagnostic operations,
 * separate from core domain configuration management.
 */

export interface TestJellyseerrConnectionCommand {
  url: string;
  apiKey: string;
}

export interface TestJellyseerrConnectionResponse {
  success: boolean;
  message: string;
}
