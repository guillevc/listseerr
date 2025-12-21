import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { EnableAllListsCommand } from 'shared/application/dtos';
import type { EnableAllListsResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class EnableAllListsUseCase implements IUseCase<
  EnableAllListsCommand,
  EnableAllListsResponse
> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: EnableAllListsCommand): Promise<EnableAllListsResponse> {
    // 1. Enable all lists
    await this.mediaListRepository.enableAll(command.userId);

    // 2. Log action
    this.logger.info('All lists enabled');

    return { success: true };
  }
}
