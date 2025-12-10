import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { IExecutionHistoryRepository } from '../repositories/execution-history.repository.interface';
import type { GetExecutionHistoryCommand } from '../dtos/processing.command.dto';
import type { GetExecutionHistoryResponse } from '../dtos/processing.response.dto';
import { MediaListNotFoundError } from '../../domain/errors/media-list.errors';

/**
 * GetExecutionHistoryUseCase
 *
 * Retrieves execution history for a specific media list:
 * 1. Verify list belongs to user (multitenancy)
 * 2. Fetch execution history
 * 3. Convert to DTOs
 */
export class GetExecutionHistoryUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly executionHistoryRepository: IExecutionHistoryRepository
  ) {}

  async execute(command: GetExecutionHistoryCommand): Promise<GetExecutionHistoryResponse> {
    // 1. Verify list belongs to user (multitenancy)
    const list = await this.mediaListRepository.findById(command.listId, command.userId);
    if (!list) {
      throw new MediaListNotFoundError(command.listId);
    }

    // 2. Fetch execution history
    const executions = await this.executionHistoryRepository.findByListId(
      command.listId,
      command.limit
    );

    // 3. Convert to DTOs
    return {
      executions: executions.map(e => e.toDTO()),
    };
  }
}
