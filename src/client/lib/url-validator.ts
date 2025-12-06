import { ListProvider } from '@/shared/types';

interface ValidationResult {
  isValid: boolean;
  provider?: ListProvider;
  error?: string;
}

const providerPatterns: Record<ListProvider, RegExp[]> = {
  trakt: [
    /^https?:\/\/(www\.)?trakt\.tv\/users\/[^/]+\/lists\/[^/]+\/?$/i,
  ],
  traktChart: [
    /^https?:\/\/(www\.)?trakt\.tv\/(movies|shows)\/(trending|popular|favorited|played|watched|collected|anticipated)\/?$/i,
  ],
  letterboxd: [
    /^https?:\/\/(www\.)?letterboxd\.com\/[^/]+\/list\/[^/]+\/?$/i,
  ],
  mdblist: [
    /^https?:\/\/(www\.)?mdblist\.com\/lists\/[^/]+\/[^/]+\/?$/i,
  ],
  imdb: [
    /^https?:\/\/(www\.)?imdb\.com\/list\/ls\d+\/?$/i,
  ],
  stevenlu: [
    // StevenLu doesn't use user-provided URLs, but we include a pattern for internal use
    /^https?:\/\/movies\.stevenlu\.com\/?$/i,
  ],
};

export function validateAndDetectProvider(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required',
    };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://',
    };
  }

  for (const [provider, patterns] of Object.entries(providerPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmedUrl)) {
        return {
          isValid: true,
          provider: provider as ListProvider,
        };
      }
    }
  }

  return {
    isValid: false,
    error: 'URL format not recognized. Supported providers: Trakt, Letterboxd, MDBList, IMDB',
  };
}

export function getProviderName(provider: ListProvider): string {
  const names: Record<ListProvider, string> = {
    trakt: 'Trakt List',
    traktChart: 'Trakt Chart',
    letterboxd: 'Letterboxd',
    mdblist: 'MDBList',
    imdb: 'IMDB',
    stevenlu: 'StevenLu',
  };
  return names[provider];
}

export function getProviderColor(provider: ListProvider): string {
  const colors: Record<ListProvider, string> = {
    trakt: 'bg-flexoki-magenta',
    traktChart: 'bg-flexoki-magenta',
    letterboxd: 'bg-flexoki-orange',
    mdblist: 'bg-flexoki-blue',
    imdb: 'bg-flexoki-yellow',
    stevenlu: 'bg-flexoki-green',
  };
  return colors[provider];
}
