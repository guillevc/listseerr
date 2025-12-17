import { InvalidProviderError } from '../errors/provider.errors';

const Values = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
  TRAKT_CHART: 'traktChart',
  STEVENLU: 'stevenlu',
} as const;

const UrlPatterns: Record<ProviderType, RegExp[]> = {
  trakt: [/^https?:\/\/(www\.)?trakt\.tv\/users\/[^/]+\/lists\/[^/]+\/?/i],
  traktChart: [
    /^https?:\/\/(www\.)?trakt\.tv\/(movies|shows)\/(trending|popular|favorited|played|watched|collected|anticipated)\/?$/i,
  ],
  mdblist: [/^https?:\/\/(www\.)?mdblist\.com\/lists\/[^/]+\/[^/]+\/?/i],
  stevenlu: [/^https?:\/\/movies\.stevenlu\.com\/?$/i],
};

export type ProviderType = (typeof Values)[keyof typeof Values];

export class ProviderVO {
  private constructor(private readonly value: ProviderType) {}

  static create(value: string): ProviderVO {
    if (!this.isValid(value)) {
      throw new InvalidProviderError(value);
    }
    return new ProviderVO(value as ProviderType);
  }

  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as ProviderType);
  }

  /**
   * Detects the provider from a URL by testing against all provider patterns.
   * Returns the ProviderVO if a match is found, null otherwise.
   */
  static detectFromUrl(url: string): ProviderVO | null {
    if (!url || typeof url !== 'string') return null;

    const trimmedUrl = url.trim();
    for (const [provider, patterns] of Object.entries(UrlPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(trimmedUrl)) {
          return new ProviderVO(provider as ProviderType);
        }
      }
    }
    return null;
  }

  getValue(): ProviderType {
    return this.value;
  }

  isTrakt(): boolean {
    return this.value === Values.TRAKT;
  }

  isMdbList(): boolean {
    return this.value === Values.MDBLIST;
  }

  isTraktChart(): boolean {
    return this.value === Values.TRAKT_CHART;
  }

  isStevenLu(): boolean {
    return this.value === Values.STEVENLU;
  }

  equals(other: ProviderVO): boolean {
    return this.value === other.value;
  }

  getDisplayName(): string {
    switch (this.value) {
      case 'trakt':
        return 'Trakt List';
      case 'traktChart':
        return 'Trakt Chart';
      case 'mdblist':
        return 'MDBList';
      case 'stevenlu':
        return 'StevenLu';
    }
  }

  requiresUrlConversion(): boolean {
    return this.value === Values.TRAKT || this.value === Values.TRAKT_CHART;
  }

  /**
   * Checks if a URL matches this provider's patterns.
   */
  matchesUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const patterns = UrlPatterns[this.value];
    const trimmedUrl = url.trim();
    return patterns.some((pattern) => pattern.test(trimmedUrl));
  }
}
