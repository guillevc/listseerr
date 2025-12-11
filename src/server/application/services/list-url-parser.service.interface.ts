import type { ProviderType } from '../../../shared/domain/types/provider.types';

export interface ParsedUrls {
  apiUrl: string;
  displayUrl: string;
}

export interface IListUrlParserService {
  parseUrlForProvider(
    url: string,
    provider: ProviderType,
    providedDisplayUrl?: string
  ): ParsedUrls;
}
