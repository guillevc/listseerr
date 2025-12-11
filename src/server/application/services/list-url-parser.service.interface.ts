import type { Provider } from '../../../shared/domain/value-objects/provider.value-object';

export interface ParsedUrls {
  apiUrl: string;
  displayUrl: string;
}

export interface IListUrlParserService {
  parseUrlForProvider(
    url: string,
    provider: Provider,
    providedDisplayUrl?: string
  ): ParsedUrls;
}
