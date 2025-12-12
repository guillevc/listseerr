import type { ILogBufferService } from '../../services/log-buffer.service.interface';
import type { GetLogsCommand } from 'shared/application/dtos/logs/commands.dto';
import type { GetLogsResponse } from 'shared/application/dtos/logs/responses.dto';

/**
 * GetLogsUseCase
 *
 * Retrieves logs from in-memory buffer with optional filtering.
 *
 * Business Rules:
 * - Limit is enforced to prevent excessive memory usage
 * - Level filter applied by infrastructure layer
 */
export class GetLogsUseCase {
  constructor(private readonly logBufferService: ILogBufferService) {}

  async execute(command: GetLogsCommand): Promise<GetLogsResponse> {
    // Delegate to infrastructure service
    const logs = this.logBufferService.getLogs(
      command.limit,
      command.level === 'all' ? undefined : command.level
    );

    return { logs };
  }
}
