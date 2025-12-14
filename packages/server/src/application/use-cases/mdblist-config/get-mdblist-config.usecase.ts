import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import { MdbListConfigMapper } from '@/server/application/mappers/mdblist-config.mapper';
import type {
  GetMdbListConfigCommand,
  GetMdbListConfigResponse,
} from 'shared/application/dtos/mdblist-config.commands.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class GetMdbListConfigUseCase implements IUseCase<
  GetMdbListConfigCommand,
  GetMdbListConfigResponse
> {
  constructor(private readonly mdbListConfigRepository: IMdbListConfigRepository) {}

  async execute(command: GetMdbListConfigCommand): Promise<GetMdbListConfigResponse> {
    const config = await this.mdbListConfigRepository.findByUserId(command.userId);

    return {
      config: config ? MdbListConfigMapper.toDTO(config) : null,
    };
  }
}
