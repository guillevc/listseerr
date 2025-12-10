import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { ISchedulerService } from '../services/scheduler.service.interface';
import type { ILogger } from '../services/logger.interface';
import type { EnableAllListsCommand } from '../dtos/media-list.command.dto';
import type { EnableAllListsResponse } from '../dtos/media-list.response.dto';

export class EnableAllListsUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly schedulerService: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  async execute(command: EnableAllListsCommand): Promise<EnableAllListsResponse> {
    // 1. Enable all lists
    await this.mediaListRepository.enableAll(command.userId);

    // 2. Log action
    this.logger.info('All lists enabled');

    // 3. Reload scheduler to pick up all enabled lists
    await this.schedulerService.loadScheduledLists();

    return { success: true };
  }
}
