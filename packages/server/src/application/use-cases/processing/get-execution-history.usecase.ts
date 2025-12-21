import type { IExecutionHistoryRepository } from '@/server/application/repositories/execution-history.repository.interface';
import { ProcessingExecutionMapper } from '@/server/application/mappers/processing-execution.mapper';
import type { GetExecutionHistoryCommand } from 'shared/application/dtos';
import type { GetExecutionHistoryResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

/**
 * GetExecutionHistoryUseCase
 *
 * Retrieves execution history for a specific media list:
 * 1. Fetch execution history (repository validates userId via JOIN - defense-in-depth)
 * 2. Convert to DTOs
 */
export class GetExecutionHistoryUseCase implements IUseCase<
  GetExecutionHistoryCommand,
  GetExecutionHistoryResponse
> {
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
      executions: executions.map((e) => ProcessingExecutionMapper.toDTO(e)),
    };
  }
}
