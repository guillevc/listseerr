import type { IJellyseerrConnectionTester } from '../../services/jellyseerr-connection-tester.service.interface';
import type {
  TestJellyseerrConnectionCommand,
  TestJellyseerrConnectionResponse,
} from 'shared/application/dtos/diagnostics/jellyseerr-connection-test.dto';
import { JellyseerrUrl } from 'shared/domain/value-objects/jellyseerr-url.value-object';
import { JellyseerrApiKey } from 'shared/domain/value-objects/jellyseerr-api-key.value-object';
import { DomainError } from 'shared/domain/errors/domain.error';

export class TestJellyseerrConnectionUseCase {
  constructor(private readonly connectionTester: IJellyseerrConnectionTester) {}

  async execute(
    command: TestJellyseerrConnectionCommand
  ): Promise<TestJellyseerrConnectionResponse> {
    // Validate input using Value Objects
    try {
      const urlVO = JellyseerrUrl.create(command.url);
      const apiKeyVO = JellyseerrApiKey.create(command.apiKey);

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
