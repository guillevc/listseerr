import type { ProcessingExecution } from '@/server/domain/entities/processing-execution.entity';
import type { ExecutionHistoryDTO } from 'shared/application/dtos/core/execution-history.dto';

export class ProcessingExecutionMapper {
  static toDTO(entity: ProcessingExecution): ExecutionHistoryDTO {
    return {
      id: entity.id,
      listId: entity.listId,
      batchId: entity.batchId.getValue(),
      status: entity.status.getValue(),
      triggerType: entity.triggerType.getValue(),
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      itemsFound: entity.itemsFound,
      itemsRequested: entity.itemsRequested,
      itemsFailed: entity.itemsFailed,
      errorMessage: entity.errorMessage,
    };
  }
}
