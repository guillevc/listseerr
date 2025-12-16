import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { GetAllMediaListsCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { GetAllMediaListsResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class GetAllMediaListsUseCase implements IUseCase<
  GetAllMediaListsCommand,
  GetAllMediaListsResponse
> {
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  async execute(command: GetAllMediaListsCommand): Promise<GetAllMediaListsResponse> {
    const lists = await this.mediaListRepository.findAllWithLastProcessed(command.userId);
    return { lists };
  }
}
