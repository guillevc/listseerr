/**
 * Diagnostics DTOs
 *
 * These DTOs are for cross-domain diagnostic operations,
 * separate from core domain configuration management.
 */

import type {
  JellyseerrUrlPrimitive,
  JellyseerrApiKeyPrimitive,
} from '../../../domain/types/jellyseerr.types';

export interface TestJellyseerrConnectionCommand {
  url: JellyseerrUrlPrimitive;
  apiKey: JellyseerrApiKeyPrimitive;
}

export interface TestJellyseerrConnectionResponse {
  success: boolean;
  message: string;
}
