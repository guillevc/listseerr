/**
 * Trakt Client ID Value Object
 *
 * Server-only VO that handles business invariants for Trakt client IDs.
 */

import { InvalidTraktClientIdError } from 'shared/domain/errors';
import type { TraktClientIdPrimitive } from 'shared/domain/types';

export class TraktClientIdVO {
  private constructor(private readonly value: TraktClientIdPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: TraktClientIdPrimitive): TraktClientIdVO {
    return new TraktClientIdVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): TraktClientIdVO {
    const trimmed = value.trim();
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

  equals(other: TraktClientIdVO): boolean {
    return this.value === other.value;
  }
}
