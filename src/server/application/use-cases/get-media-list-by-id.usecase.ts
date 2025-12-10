import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { GetMediaListByIdCommand, GetMediaListByIdResponse } from '../dtos/media-list.command.dto';

export class GetMediaListByIdUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository
  ) {}

  async execute(command: GetMediaListByIdCommand): Promise<GetMediaListByIdResponse> {
    const list = await this.mediaListRepository.findById(command.id);

    return {
      list: list ? list.toDTO() : null,
    };
  }
}
