import type { ProviderType } from '../../domain/types/media-list.types';

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
