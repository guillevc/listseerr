import { InvalidJellyseerrUserIdError } from '../errors/jellyseerr-config.errors';

export class JellyseerrUserIdVO {
  private constructor(private readonly value: number) {}

  static create(userId: number): JellyseerrUserIdVO {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new InvalidJellyseerrUserIdError(userId);
    }

    return new JellyseerrUserIdVO(userId);
  }

  getValue(): number {
    return this.value;
  }
}
