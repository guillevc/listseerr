import type { IExecutionHistoryRepository } from '../repositories/execution-history.repository.interface';
import type { GetExecutionHistoryCommand } from 'shared/application/dtos/processing/commands.dto';
import type { GetExecutionHistoryResponse } from 'shared/application/dtos/processing/responses.dto';

/**
 * GetExecutionHistoryUseCase
 *
 * Retrieves execution history for a specific media list:
 * 1. Fetch execution history (repository validates userId via JOIN - defense-in-depth)
 * 2. Convert to DTOs
 */
export class GetExecutionHistoryUseCase {
  constructor(private readonly executionHistoryRepository: IExecutionHistoryRepository) {}

  async execute(command: GetExecutionHistoryCommand): Promise<GetExecutionHistoryResponse> {
    // Fetch execution history (repository validates userId ownership via JOIN)
    const executions = await this.executionHistoryRepository.findByListId(
      command.listId,
      command.userId,
      command.limit
    );

    // Convert to DTOs
    return {
      executions: executions.map((e) => e.toDTO()),
    };
  }
}
