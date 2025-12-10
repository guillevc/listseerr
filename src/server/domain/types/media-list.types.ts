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
  processingSchedule?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaListWithLastProcessed extends MediaListProps {
  lastProcessed: Date | null;
}
