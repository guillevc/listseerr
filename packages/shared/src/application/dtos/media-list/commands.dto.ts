/**
 * Command DTOs (Input)
 *
 * These represent the input data for each use case.
 * They contain only primitives - no Value Objects or Entities.
 * Primitive types are used (e.g., ProviderType) which schemas validate.
 */

import type { CreateListPrimitive, UpdateListPrimitive } from 'shared/domain/types/list.types';

export interface CreateMediaListCommand extends CreateListPrimitive {
  userId: number;
}

export interface UpdateMediaListCommand {
  id: number;
  userId: number;
  data: UpdateListPrimitive;
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
