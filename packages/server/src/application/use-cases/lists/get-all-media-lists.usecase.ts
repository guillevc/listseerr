import type { IMediaListRepository } from '../../repositories/media-list.repository.interface';
import type { GetAllMediaListsCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { GetAllMediaListsResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';

export class GetAllMediaListsUseCase implements IUseCase<
  GetAllMediaListsCommand,
  GetAllMediaListsResponse
> {
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  @LogExecution('lists:get-all')
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
