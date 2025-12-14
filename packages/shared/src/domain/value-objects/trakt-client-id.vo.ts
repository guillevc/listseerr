import { InvalidTraktClientIdError } from '../errors/provider-config.errors';

export class TraktClientIdVO {
  private constructor(private readonly value: string) {}

  static create(clientId: string): TraktClientIdVO {
    const trimmed = clientId.trim();

    // Validate format: 64 hexadecimal characters (lowercase)
    const hexPattern = /^[0-9a-f]{64}$/;
    if (!hexPattern.test(trimmed)) {
      throw new InvalidTraktClientIdError(
        'Trakt Client ID must be exactly 64 hexadecimal characters (0-9, a-f). ' +
          'Get your Client ID from https://trakt.tv/oauth/applications'
      );
    }

    return new TraktClientIdVO(trimmed);
  }

  getValue(): string {
    return this.value;
  }
}
