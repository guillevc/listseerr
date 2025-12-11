import type { ProviderType } from '../core/media-list.dto';
import type { Nullable } from '@/domain/types/utility.types';

/**
 * Command DTOs (Input)
 *
 * These represent the input data for each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface CreateMediaListCommand {
  name: string;
  url: string;
  displayUrl?: string;
  provider: ProviderType;
  enabled: boolean;
  maxItems: number;
  processingSchedule: Nullable<string>;
  userId: number;
}

export interface UpdateMediaListCommand {
  id: number;
  userId: number;
  data: {
    name?: string;
    url?: string;
    displayUrl?: string;
    provider?: ProviderType;
    enabled?: boolean;
    maxItems?: number;
    processingSchedule?: Nullable<string>;
  };
}

export interface GetMediaListByIdCommand {
  id: number;
  userId: number;
}

export interface GetAllMediaListsCommand {
  userId: number;
}

export interface ToggleListEnabledCommand {
  id: number;
  userId: number;
}

export interface DeleteMediaListCommand {
  id: number;
  userId: number;
}

export interface EnableAllListsCommand {
  userId: number;
}
