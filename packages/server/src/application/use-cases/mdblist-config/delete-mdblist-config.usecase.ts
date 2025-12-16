import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import type {
  DeleteMdbListConfigCommand,
  DeleteMdbListConfigResponse,
} from 'shared/application/dtos/mdblist-config.commands.dto';
import { MdbListConfigNotFoundError } from 'shared/domain/errors/mdblist-config.errors';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class DeleteMdbListConfigUseCase implements IUseCase<
  DeleteMdbListConfigCommand,
  DeleteMdbListConfigResponse
> {
  constructor(
    private readonly mdbListConfigRepository: IMdbListConfigRepository,
    private readonly logger: ILogger
  ) {}

  async execute(command: DeleteMdbListConfigCommand): Promise<DeleteMdbListConfigResponse> {
    const config = await this.mdbListConfigRepository.findByUserId(command.userId);

    if (!config) {
      throw new MdbListConfigNotFoundError(command.userId);
    }

    await this.mdbListConfigRepository.delete(config);

    this.logger.info({ userId: command.userId }, 'MdbList config deleted');

    return { success: true };
  }
}
