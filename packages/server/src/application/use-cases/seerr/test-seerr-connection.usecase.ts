import type { ISeerrConnectionTester } from '@/server/application/services/seerr-connection-tester.service.interface';
import type {
  TestSeerrConnectionCommand,
  TestSeerrConnectionResponse,
} from 'shared/application/dtos';
import { SeerrUrlVO } from '@/server/domain/value-objects/seerr-url.vo';
import { SeerrApiKeyVO } from '@/server/domain/value-objects/seerr-api-key.vo';
import { DomainError } from 'shared/domain/errors';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class TestSeerrConnectionUseCase implements IUseCase<
  TestSeerrConnectionCommand,
  TestSeerrConnectionResponse
> {
  constructor(private readonly connectionTester: ISeerrConnectionTester) {}

  async execute(command: TestSeerrConnectionCommand): Promise<TestSeerrConnectionResponse> {
    // Validate input using Value Objects
    try {
      const urlVO = SeerrUrlVO.create(command.url);
      const apiKeyVO = SeerrApiKeyVO.create(command.apiKey);

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
