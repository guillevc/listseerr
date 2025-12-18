import type { ProviderVO } from '@/server/domain/value-objects/provider.vo';

export interface ParsedUrls {
  apiUrl: string;
  displayUrl: string;
}

export interface IListUrlParserService {
  parseUrlForProvider(url: string, provider: ProviderVO, providedDisplayUrl?: string): ParsedUrls;
}
