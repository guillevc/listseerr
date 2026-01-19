import type { ProviderType } from 'shared/domain/types';
import type { TraktChartType, TraktMediaType } from 'shared/domain/types';
import type { AnilistStatus } from 'shared/presentation/schemas';

export interface AddListFormState {
  name: string;
  url: string;
  maxItems: string;
  provider: ProviderType;
  selectedMediaType: TraktMediaType;
  selectedChartType: TraktChartType;
  // AniList-specific fields
  anilistUsername: string;
  anilistStatus: AnilistStatus;
  urlError: string | null;
  userEditedName: boolean;
}

export type AddListStep = 1 | 2;
