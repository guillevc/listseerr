import type { ILogBufferService } from '@/server/application/services/core/log-buffer.service.interface';
import type { GetLogsCommand } from 'shared/application/dtos/logs/commands.dto';
import type { GetLogsResponse } from 'shared/application/dtos/logs/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

/**
 * GetLogsUseCase
 *
 * Retrieves logs from in-memory buffer with optional filtering.
 *
 * Business Rules:
 * - Limit is enforced to prevent excessive memory usage
 * - Level filter applied by infrastructure layer
 */
export class GetLogsUseCase implements IUseCase<GetLogsCommand, GetLogsResponse> {
  constructor(private readonly logBufferService: ILogBufferService) {}

  execute(command: GetLogsCommand): Promise<GetLogsResponse> {
    // Delegate to infrastructure service
    const logs = this.logBufferService.getLogs(
      command.limit,
      command.level === 'all' ? undefined : command.level
    );

    return Promise.resolve({ logs });
  }
}
