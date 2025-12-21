import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import { MediaListMapper } from '@/server/application/mappers/media-list.mapper';
import type { GetMediaListByIdCommand } from 'shared/application/dtos';
import type { GetMediaListByIdResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class GetMediaListByIdUseCase implements IUseCase<
  GetMediaListByIdCommand,
  GetMediaListByIdResponse
> {
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  async execute(command: GetMediaListByIdCommand): Promise<GetMediaListByIdResponse> {
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    return {
      list: list ? MediaListMapper.toDTO(list) : null,
    };
  }
}
