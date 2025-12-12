import type { ILogBufferService } from '@/application/services/log-buffer.service.interface';
import type { ClearLogsCommand } from 'shared/application/dtos/logs/commands.dto';
import type { ClearLogsResponse } from 'shared/application/dtos/logs/responses.dto';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import { LogExecution } from '@/infrastructure/services/core/decorators/log-execution.decorator';

/**
 * ClearLogsUseCase
 *
 * Clears all logs from in-memory buffer.
 *
 * Business Rules:
 * - Clears all logs regardless of level or timestamp
 * - Operation is immediate and irreversible
 */
export class ClearLogsUseCase implements IUseCase<ClearLogsCommand, ClearLogsResponse> {
  constructor(private readonly logBufferService: ILogBufferService) {}

  @LogExecution('logs:clear')
  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _command: ClearLogsCommand
  ): Promise<ClearLogsResponse> {
    // Delegate to infrastructure service
    // Note: _command.userId reserved for future multitenancy validation
    this.logBufferService.clear();

    return { success: true };
  }
}
