import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { GetAllMediaListsCommand, GetAllMediaListsResponse } from '../dtos/media-list.command.dto';

export class GetAllMediaListsUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository
  ) {}

  async execute(command: GetAllMediaListsCommand): Promise<GetAllMediaListsResponse> {
    const lists = await this.mediaListRepository.findAllWithLastProcessed(command.userId);

    return {
      lists,
    };
  }
}
