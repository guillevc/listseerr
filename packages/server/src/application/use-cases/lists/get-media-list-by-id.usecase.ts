import type { IMediaListRepository } from '@/application/repositories/media-list.repository.interface';
import type { GetMediaListByIdCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { GetMediaListByIdResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import { LogExecution } from '@/infrastructure/services/core/decorators/log-execution.decorator';

export class GetMediaListByIdUseCase implements IUseCase<
  GetMediaListByIdCommand,
  GetMediaListByIdResponse
> {
  constructor(private readonly mediaListRepository: IMediaListRepository) {}

  @LogExecution('lists:get-by-id')
  async execute(command: GetMediaListByIdCommand): Promise<GetMediaListByIdResponse> {
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    return {
      list: list ? list.toDTO() : null,
    };
  }
}
