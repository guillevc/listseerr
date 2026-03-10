/**
 * List Types
 *
 * Pure TypeScript contracts for media list data.
 * Schemas must satisfy these types.
 */

import type { ProviderType } from './provider.types';
import type { SeerrUserIdPrimitive } from './seerr.types';

export type ListNamePrimitive = string;
export type ListUrlPrimitive = string;
export type MaxItemsPrimitive = number;

export interface CreateListPrimitive {
  name: ListNamePrimitive;
  url: ListUrlPrimitive;
  displayUrl?: string;
  provider: ProviderType;
  enabled: boolean;
  maxItems: MaxItemsPrimitive;
  seerrUserIdOverride?: SeerrUserIdPrimitive | null;
}

export type UpdateListPrimitive = Partial<CreateListPrimitive>;
