import type { Provider } from 'shared/domain/value-objects/provider.value-object';
import { ProviderValues } from 'shared/domain/types/provider.types';
import type {
  IListUrlParserService,
  ParsedUrls,
} from '../../application/services/list-url-parser.service.interface';
import { convertDisplayUrlToApiUrl as convertTraktUrl } from '../../services/trakt/url-parser';
import { convertDisplayUrlToApiUrl as convertTraktChartUrl } from '../../services/trakt/chart-client';

export class ListUrlParserService implements IListUrlParserService {
  parseUrlForProvider(
    url: string,
    provider: Provider,
    providedDisplayUrl?: string
  ): ParsedUrls {
    const providerValue = provider.getValue();

    switch (providerValue) {
      case ProviderValues.TRAKT:
        return this.parseTraktUrl(url, providedDisplayUrl);

      case ProviderValues.TRAKT_CHART:
        return this.parseTraktChartUrl(url, providedDisplayUrl);

      case ProviderValues.MDBLIST:
        return this.parseMdbListUrl(url, providedDisplayUrl);

      case ProviderValues.STEVENLU:
        return this.parseStevenLuUrl(url, providedDisplayUrl);

      default:
        throw new Error(`Unknown provider: ${providerValue}`);
    }
  }

  private parseTraktUrl(url: string, providedDisplayUrl?: string): ParsedUrls {
    // If user provides a display URL (trakt.tv), convert it to API URL
    // Otherwise, assume it's already an API URL
    const isDisplayUrl = url.includes('trakt.tv') && !url.includes('api.trakt.tv');

    if (isDisplayUrl) {
      const apiUrl = convertTraktUrl(url);
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
