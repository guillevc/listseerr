import { z } from 'zod';
import type { TraktConfigDTO } from './core/trakt-config.dto';

/**
 * Trakt Config Command DTOs
 */

export interface SaveTraktConfigCommand {
  userId: number;
  clientId: string;
}

export interface DeleteTraktConfigCommand {
  userId: number;
}

export interface GetTraktConfigCommand {
  userId: number;
}

/**
 * Trakt Config Response DTOs
 */

export interface TraktConfigResponse {
  config: TraktConfigDTO;
}

export interface GetTraktConfigResponse {
  config: TraktConfigDTO | null;
}

export interface DeleteTraktConfigResponse {
  success: boolean;
}

/**
 * Zod Schemas for tRPC validation
 */

export const saveTraktConfigSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
});

export type SaveTraktConfigInput = z.infer<typeof saveTraktConfigSchema>;
