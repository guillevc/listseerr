import type { ProviderType } from 'shared/domain/types';
import type { TraktChartType, TraktMediaType } from 'shared/domain/types';

export interface AddListFormState {
  name: string;
  url: string;
  maxItems: string;
  provider: ProviderType;
  selectedMediaType: TraktMediaType;
  selectedChartType: TraktChartType;
  urlError: string | null;
  userEditedName: boolean;
}

export type AddListStep = 1 | 2;
