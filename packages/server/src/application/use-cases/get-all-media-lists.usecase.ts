import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { GetAllMediaListsCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { GetAllMediaListsResponse } from 'shared/application/dtos/media-list/responses.dto';

export class GetAllMediaListsUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository
  ) {}

  async execute(command: GetAllMediaListsCommand): Promise<GetAllMediaListsResponse> {
    const listsFromRepo = await this.mediaListRepository.findAllWithLastProcessed(command.userId);

    // Convert repository response to DTO format (undefined → null for processingSchedule)
    const lists = listsFromRepo.map((list) => ({
      ...list,
      processingSchedule: list.processingSchedule ?? null,
    }));

    return {
      lists,
    };
  }
}
