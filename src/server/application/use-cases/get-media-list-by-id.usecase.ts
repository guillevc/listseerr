import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { GetMediaListByIdCommand } from '../dtos/media-list.command.dto';
import type { GetMediaListByIdResponse } from '../dtos/media-list.response.dto';

export class GetMediaListByIdUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository
  ) {}

  async execute(command: GetMediaListByIdCommand): Promise<GetMediaListByIdResponse> {
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    return {
      list: list ? list.toDTO() : null,
    };
  }
}
