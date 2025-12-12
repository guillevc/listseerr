import type { ILogBufferService } from '../../services/log-buffer.service.interface';
import type { ClearLogsCommand } from 'shared/application/dtos/logs/commands.dto';
import type { ClearLogsResponse } from 'shared/application/dtos/logs/responses.dto';
import type { IUseCase } from '../use-case.interface';

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
