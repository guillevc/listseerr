import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { GetMediaListByIdCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { GetMediaListByIdResponse } from 'shared/application/dtos/media-list/responses.dto';

export class GetMediaListByIdUseCase {
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  async execute(command: GetMediaListByIdCommand): Promise<GetMediaListByIdResponse> {
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    return {
      list: list ? list.toDTO() : null,
    };
  }
}
