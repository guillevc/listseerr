import type { ProviderVO } from '@/server/domain/value-objects/provider.vo';
import type {
  IListUrlParserService,
  ParsedUrls,
} from '@/server/application/services/list-url-parser.service.interface';
import { convertDisplayUrlToApiUrl as convertTraktUrl } from '@/server/infrastructure/services/external/trakt/url-parser';
import { convertDisplayUrlToApiUrl as convertTraktChartUrl } from '@/server/infrastructure/services/external/trakt/chart-client';

export class ListUrlParserService implements IListUrlParserService {
  parseUrlForProvider(url: string, provider: ProviderVO, providedDisplayUrl?: string): ParsedUrls {
    if (provider.isTrakt()) {
      return this.parseTraktUrl(url, providedDisplayUrl);
    }

    if (provider.isTraktChart()) {
      return this.parseTraktChartUrl(url, providedDisplayUrl);
    }

    if (provider.isMdbList()) {
      return this.parseMdbListUrl(url, providedDisplayUrl);
    }

    if (provider.isStevenLu()) {
      return this.parseStevenLuUrl(url, providedDisplayUrl);
    }

    throw new Error(`Unknown provider: ${provider.getValue()}`);
  }

  private parseTraktUrl(url: string, providedDisplayUrl?: string): ParsedUrls {
    // If user provides a display URL (trakt.tv), convert it to API URL
    // Otherwise, assume it's already an API URL
    const isDisplayUrl = url.includes('trakt.tv') && !url.includes('api.trakt.tv');

    if (isDisplayUrl) {
      const { apiUrl, displayUrl } = convertTraktUrl(url);
      return {
        apiUrl,
        displayUrl: providedDisplayUrl || displayUrl,
      };
    }

    // Already an API URL - keep as-is
    return {
      apiUrl: url,
      displayUrl: providedDisplayUrl || url,
    };
  }

  private parseTraktChartUrl(url: string, providedDisplayUrl?: string): ParsedUrls {
    // Similar to Trakt, convert display URL to API URL if needed
    const isDisplayUrl = url.includes('trakt.tv') && !url.includes('api.trakt.tv');

    if (isDisplayUrl) {
      const apiUrl = convertTraktChartUrl(url);
      return {
        apiUrl,
        displayUrl: providedDisplayUrl || url,
      };
    }

    // Already an API URL
    return {
      apiUrl: url,
      displayUrl: providedDisplayUrl || url,
    };
  }

  private parseMdbListUrl(url: string, providedDisplayUrl?: string): ParsedUrls {
    // MDBList doesn't require URL conversion
    // API key is added during the fetch operation
    return {
      apiUrl: url,
      displayUrl: providedDisplayUrl || url,
    };
  }

  private parseStevenLuUrl(url: string, providedDisplayUrl?: string): ParsedUrls {
    // StevenLu doesn't require URL conversion
    return {
      apiUrl: url,
      displayUrl: providedDisplayUrl || url,
    };
  }
}
