import type { Nullable } from '../../../shared/types';

export type ProviderType = 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu';

export interface MediaListProps {
  id: number;
  userId: number;
  name: string;
  url: string;
  displayUrl: string;
  provider: ProviderType;
  enabled: boolean;
  maxItems: number;
  processingSchedule: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaListWithLastProcessed extends MediaListProps {
  lastProcessed: Nullable<Date>;
}
