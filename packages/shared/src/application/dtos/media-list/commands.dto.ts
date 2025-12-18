/**
 * Command DTOs (Input)
 *
 * These represent the input data for each use case.
 * They contain only primitives - no Value Objects or Entities.
 * Primitive types are used (e.g., ProviderType) which schemas validate.
 */

import type { ProviderType } from 'shared/domain/types/provider.types';

export interface CreateMediaListCommand {
  name: string;
  url: string;
  displayUrl?: string;
  provider: ProviderType;
  enabled: boolean;
  maxItems: number;
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
