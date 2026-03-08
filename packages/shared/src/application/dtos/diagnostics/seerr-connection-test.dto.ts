/**
 * Diagnostics DTOs
 *
 * These DTOs are for cross-domain diagnostic operations,
 * separate from core domain configuration management.
 */

import type { SeerrUrlPrimitive, SeerrApiKeyPrimitive } from '../../../domain/types/seerr.types';

export interface TestSeerrConnectionCommand {
  url: SeerrUrlPrimitive;
  apiKey: SeerrApiKeyPrimitive;
}

export interface TestSeerrConnectionResponse {
  success: boolean;
  message: string;
}
