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
  provider: string;
  enabled: boolean;
  maxItems: number;
  processingSchedule: string | null;
  userId: number;
}

export interface UpdateMediaListCommand {
  id: number;
  userId: number;
  data: {
    name?: string;
    url?: string;
    displayUrl?: string;
    provider?: string;
    enabled?: boolean;
    maxItems?: number;
    processingSchedule?: string | null;
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
