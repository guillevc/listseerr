import type { IMediaListRepository } from '../../repositories/media-list.repository.interface';
import type { GetMediaListByIdCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { GetMediaListByIdResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '../use-case.interface';

export class GetMediaListByIdUseCase implements IUseCase<
  GetMediaListByIdCommand,
  GetMediaListByIdResponse
> {
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  async execute(command: GetMediaListByIdCommand): Promise<GetMediaListByIdResponse> {
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    return {
      list: list ? list.toDTO() : null,
    };
  }
}
