import type {
  IDashboardStatsRepository,
  ExecutionWithListName,
} from '../../repositories/dashboard-stats.repository.interface';
import type { GetRecentActivityCommand } from 'shared/application/dtos/dashboard/commands.dto';
import type {
  GetRecentActivityResponse,
  ActivityGroup,
} from 'shared/application/dtos/dashboard/responses.dto';
import type { ExecutionDTO } from 'shared/application/dtos/core/execution.dto';

/**
 * GetRecentActivityUseCase
 *
 * Retrieves recent execution history and groups them for display.
 * Shows only last 24 hours of activity.
 *
 * Business Rules:
 * - Group by batchId first (Process All operations)
 * - Group by time proximity (<1 minute) for individual list processing
 * - Preserve order by startedAt DESC (most recent first)
 * - Include list names for better UX
 */
export class GetRecentActivityUseCase {
  constructor(private readonly dashboardStatsRepository: IDashboardStatsRepository) {}

  async execute(command: GetRecentActivityCommand): Promise<GetRecentActivityResponse> {
    // Get recent executions from repository (already filtered to last 24h)
    const recentExecutions = await this.dashboardStatsRepository.getRecentExecutionsWithListNames(
      command.userId,
      command.limit
    );

    // Group executions using business logic
    const groups = this.groupExecutions(recentExecutions);

    return { groups };
  }

  /**
   * Groups executions by batchId or time proximity.
   *
   * Algorithm:
   * 1. If execution has batchId, find existing group with same batchId
   * 2. Otherwise, try to add to last group if within 1 minute and same triggerType
   * 3. Otherwise, create new group
   */
  private groupExecutions(executions: ExecutionWithListName[]): ActivityGroup[] {
    const grouped: ActivityGroup[] = [];

    for (const execution of executions) {
      let addedToGroup = false;

      // Try batch grouping first (Process All operations)
      if (execution.batchId) {
        const batchGroup = grouped.find((g) => g.executions[0]?.batchId === execution.batchId);

        if (batchGroup) {
          batchGroup.executions.push(this.toDTO(execution));
          addedToGroup = true;
        }
      }

      // Try time-based grouping (within 1 minute, same triggerType)
      if (!addedToGroup) {
        const lastGroup = grouped[grouped.length - 1];

        if (lastGroup && !lastGroup.executions[0]?.batchId) {
          // Only try time-based grouping if last group is not a batch
          const timeDiff = Math.abs(execution.startedAt.getTime() - lastGroup.timestamp.getTime());

          if (
            lastGroup.triggerType === execution.triggerType &&
            timeDiff < 60000 // 1 minute in milliseconds
          ) {
            lastGroup.executions.push(this.toDTO(execution));
            addedToGroup = true;
          }
        }
      }

      // Create new group
      if (!addedToGroup) {
        grouped.push({
          timestamp: execution.startedAt,
          triggerType: execution.triggerType,
          executions: [this.toDTO(execution)],
        });
      }
    }

    return grouped;
  }

  /**
   * Converts repository model to DTO
   */
  private toDTO(execution: ExecutionWithListName): ExecutionDTO {
    return {
      id: execution.id,
      listId: execution.listId,
      listName: execution.listName,
      batchId: execution.batchId,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      status: execution.status,
      triggerType: execution.triggerType,
      itemsFound: execution.itemsFound,
      itemsRequested: execution.itemsRequested,
      itemsFailed: execution.itemsFailed,
      errorMessage: execution.errorMessage,
    };
  }
}
