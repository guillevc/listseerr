/**
 * List URL Value Object
 *
 * Server-only VO that handles business invariants for list URLs.
 */

import { InvalidListUrlError } from 'shared/domain/errors';
import type { ListUrlPrimitive } from 'shared/domain/types';

export class ListUrlVO {
  private constructor(private readonly value: ListUrlPrimitive) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: ListUrlPrimitive): ListUrlVO {
    return new ListUrlVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): ListUrlVO {
    const [cleaned = value] = value.split('?');

    // Handle special AniList URL scheme: anilist:{username}:{status}
    if (cleaned.startsWith('anilist:')) {
      const anilistPattern =
        /^anilist:[^:]+:(CURRENT|PLANNING|COMPLETED|DROPPED|PAUSED|REPEATING)$/i;
      if (!anilistPattern.test(cleaned)) {
        throw new InvalidListUrlError(value);
      }
      return new ListUrlVO(cleaned);
    }

    // Standard URL validation
    try {
      new URL(cleaned);
    } catch {
      throw new InvalidListUrlError(value);
    }

    return new ListUrlVO(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ListUrlVO): boolean {
    return this.value === other.value;
  }
}
