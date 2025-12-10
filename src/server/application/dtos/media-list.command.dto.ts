import type { ProviderType } from '../../domain/types/media-list.types';

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
  processingSchedule?: string;
  userId: number;
}

export interface UpdateMediaListCommand {
  id: number;
  data: {
    name?: string;
    url?: string;
    displayUrl?: string;
    provider?: ProviderType;
    enabled?: boolean;
    maxItems?: number;
    processingSchedule?: string;
  };
}

export interface GetMediaListByIdCommand {
  id: number;
}

export interface GetAllMediaListsCommand {
  userId: number;
}

export interface ToggleListEnabledCommand {
  id: number;
}

export interface DeleteMediaListCommand {
  id: number;
}

export interface EnableAllListsCommand {
  userId: number;
}
