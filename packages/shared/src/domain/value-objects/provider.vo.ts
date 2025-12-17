import { InvalidProviderError } from '../errors/provider.errors';

const Values = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
  TRAKT_CHART: 'traktChart',
  STEVENLU: 'stevenlu',
} as const;

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
}
