import { InvalidListNameError } from '../errors/media-list.errors';

export class ListName {
  private constructor(private readonly value: string) {}

  static create(name: string): ListName {
    if (!name || name.trim().length === 0) {
      throw new InvalidListNameError();
    }

    return new ListName(name.trim());
  }

  getValue(): string {
    return this.value;
  }
}
