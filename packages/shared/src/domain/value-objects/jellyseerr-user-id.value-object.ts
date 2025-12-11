import { InvalidJellyseerrUserIdError } from '../errors/jellyseerr-config.errors';

export class JellyseerrUserId {
  private constructor(private readonly value: number) {}

  static create(userId: number): JellyseerrUserId {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new InvalidJellyseerrUserIdError(userId);
    }

    return new JellyseerrUserId(userId);
  }

  getValue(): number {
    return this.value;
  }
}
