import { z } from 'zod';
import type { MdbListConfigDTO } from './core/mdblist-config.dto';

/**
 * MdbList Config Command DTOs
 */

export interface SaveMdbListConfigCommand {
  userId: number;
  apiKey: string;
}

export interface DeleteMdbListConfigCommand {
  userId: number;
}

export interface GetMdbListConfigCommand {
  userId: number;
}

/**
 * MdbList Config Response DTOs
 */

export interface MdbListConfigResponse {
  config: MdbListConfigDTO;
}

export interface GetMdbListConfigResponse {
  config: MdbListConfigDTO | null;
}

export interface DeleteMdbListConfigResponse {
  success: boolean;
}

/**
 * Zod Schemas for tRPC validation
 */

export const saveMdbListConfigSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
});

export type SaveMdbListConfigInput = z.infer<typeof saveMdbListConfigSchema>;
