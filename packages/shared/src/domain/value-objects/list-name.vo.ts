import { InvalidListNameError } from '../errors/media-list.errors';

export class ListNameVO {
  private constructor(private readonly value: string) {}

  static create(name: string): ListNameVO {
    if (!name || name.trim().length === 0) {
      throw new InvalidListNameError();
    }

    return new ListNameVO(name.trim());
  }

  getValue(): string {
    return this.value;
  }
}
