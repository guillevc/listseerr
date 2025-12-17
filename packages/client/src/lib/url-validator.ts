import { ProviderVO, type ProviderType } from 'shared/domain/value-objects/provider.vo';

interface ValidationResult {
  isValid: boolean;
  provider?: ProviderType;
  error?: string;
}

const providerPatterns: Record<ProviderType, RegExp[]> = {
  trakt: [/^https?:\/\/(www\.)?trakt\.tv\/users\/[^/]+\/lists\/[^/]+\/?$/i],
  traktChart: [
    /^https?:\/\/(www\.)?trakt\.tv\/(movies|shows)\/(trending|popular|favorited|played|watched|collected|anticipated)\/?$/i,
  ],
  mdblist: [/^https?:\/\/(www\.)?mdblist\.com\/lists\/[^/]+\/[^/]+\/?$/i],
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
          provider: provider as ProviderType,
        };
      }
    }
  }

  return {
    isValid: false,
    error: 'URL format not recognized. Supported providers: Trakt, MDBList',
  };
}

export function getProviderName(provider: ProviderType): string {
  return ProviderVO.getDisplayName(provider);
}
