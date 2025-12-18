import type { IJellyseerrConnectionTester } from '@/server/application/services/jellyseerr-connection-tester.service.interface';
import type {
  TestJellyseerrConnectionCommand,
  TestJellyseerrConnectionResponse,
} from 'shared/application/dtos/diagnostics/jellyseerr-connection-test.dto';
import { JellyseerrUrlVO } from '@/server/domain/value-objects/jellyseerr-url.vo';
import { JellyseerrApiKeyVO } from '@/server/domain/value-objects/jellyseerr-api-key.vo';
import { DomainError } from 'shared/domain/errors/domain.error';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class TestJellyseerrConnectionUseCase implements IUseCase<
  TestJellyseerrConnectionCommand,
  TestJellyseerrConnectionResponse
> {
  constructor(private readonly connectionTester: IJellyseerrConnectionTester) {}

  async execute(
    command: TestJellyseerrConnectionCommand
  ): Promise<TestJellyseerrConnectionResponse> {
    // Validate input using Value Objects
    try {
      const urlVO = JellyseerrUrlVO.create(command.url);
      const apiKeyVO = JellyseerrApiKeyVO.create(command.apiKey);

      // Delegate to external service
      return await this.connectionTester.testConnection(urlVO.getValue(), apiKeyVO.getValue());
    } catch (error) {
      // Handle domain validation errors
      if (error instanceof DomainError) {
        return {
          success: false,
          message: error.message,
        };
      }
      // Unexpected error
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
