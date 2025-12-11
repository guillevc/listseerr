import { ExecutionStatus } from '../../../shared/domain/value-objects/execution-status.value-object';
import { TriggerType } from '../../../shared/domain/value-objects/trigger-type.value-object';
import { BatchId } from '../../../shared/domain/value-objects/batch-id.value-object';
import { InvalidExecutionStatusTransitionError } from '../../../shared/domain/errors/processing.errors';
import type { ExecutionHistoryDTO } from '../../../shared/application/dtos/core/execution-history.dto';

/**
 * ProcessingExecution Entity
 *
 * Encapsulates the lifecycle of a processing execution.
 * Enforces business rules and status transitions.
 *
 * Business Rules:
 * - Cannot transition from 'success'/'error' back to 'running'
 * - completedAt must be set when marking as success/error
 * - Metrics (itemsFound, itemsRequested, itemsFailed) only valid for success status
 */
export class ProcessingExecution {
  private _id: number;
  private readonly _listId: number;
  private readonly _batchId: BatchId;
  private _status: ExecutionStatus;
  private readonly _triggerType: TriggerType;
  private readonly _startedAt: Date;
  private _completedAt: Date | null;
  private _itemsFound: number;
  private _itemsRequested: number;
  private _itemsFailed: number;
  private _errorMessage: string | null;

  constructor(params: {
    id: number;
    listId: number;
    batchId: BatchId;
    status: ExecutionStatus;
    triggerType: TriggerType;
    startedAt: Date;
    completedAt: Date | null;
    itemsFound: number;
    itemsRequested: number;
    itemsFailed: number;
    errorMessage: string | null;
  }) {
    this._id = params.id;
    this._listId = params.listId;
    this._batchId = params.batchId;
    this._status = params.status;
    this._triggerType = params.triggerType;
    this._startedAt = params.startedAt;
    this._completedAt = params.completedAt;
    this._itemsFound = params.itemsFound;
    this._itemsRequested = params.itemsRequested;
    this._itemsFailed = params.itemsFailed;
    this._errorMessage = params.errorMessage;
  }

  /**
   * Factory method for creating a new execution (not yet persisted)
   */
  static create(props: {
    listId: number;
    batchId: BatchId;
    triggerType: TriggerType;
  }): ProcessingExecution {
    return new ProcessingExecution({
      id: 0, // Will be set by repository on save
      listId: props.listId,
      batchId: props.batchId,
      status: ExecutionStatus.running(),
      triggerType: props.triggerType,
      startedAt: new Date(),
      completedAt: null,
      itemsFound: 0,
      itemsRequested: 0,
      itemsFailed: 0,
      errorMessage: null,
    });
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get listId(): number {
    return this._listId;
  }

  get batchId(): BatchId {
    return this._batchId;
  }

  get status(): ExecutionStatus {
    return this._status;
  }

  get triggerType(): TriggerType {
    return this._triggerType;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get itemsFound(): number {
    return this._itemsFound;
  }

  get itemsRequested(): number {
    return this._itemsRequested;
  }

  get itemsFailed(): number {
    return this._itemsFailed;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  // Business methods

  /**
   * Mark execution as successfully completed
   * @throws InvalidExecutionStatusTransitionError if already completed
   */
  markAsSuccess(itemsFound: number, itemsRequested: number, itemsFailed: number): void {
    if (this._status.isCompleted()) {
      throw new InvalidExecutionStatusTransitionError(
        this._status.getValue(),
        'success'
      );
    }

    this._status = ExecutionStatus.success();
    this._completedAt = new Date();
    this._itemsFound = itemsFound;
    this._itemsRequested = itemsRequested;
    this._itemsFailed = itemsFailed;
    this._errorMessage = null;
  }

  /**
   * Mark execution as failed with error message
   * @throws InvalidExecutionStatusTransitionError if already completed
   */
  markAsError(errorMessage: string): void {
    if (this._status.isCompleted()) {
      throw new InvalidExecutionStatusTransitionError(
        this._status.getValue(),
        'error'
      );
    }

    this._status = ExecutionStatus.error();
    this._completedAt = new Date();
    this._errorMessage = errorMessage;
    this._itemsFound = 0;
    this._itemsRequested = 0;
    this._itemsFailed = 0;
  }

  /**
   * Check if execution is currently running
   */
  isRunning(): boolean {
    return this._status.isRunning();
  }

  /**
   * Check if execution is completed (success or error)
   */
  isCompleted(): boolean {
    return this._status.isCompleted();
  }

  /**
   * Get execution duration in milliseconds
   * Returns null if not yet completed
   */
  getDuration(): number | null {
    if (!this._completedAt) {
      return null;
    }

    return this._completedAt.getTime() - this._startedAt.getTime();
  }

  /**
   * Convert entity to DTO for crossing application boundary
   */
  toDTO(): ExecutionHistoryDTO {
    return {
      id: this._id,
      listId: this._listId,
      batchId: this._batchId.getValue(),
      status: this._status.getValue(),
      triggerType: this._triggerType.getValue(),
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      itemsFound: this._itemsFound,
      itemsRequested: this._itemsRequested,
      itemsFailed: this._itemsFailed,
      errorMessage: this._errorMessage,
    };
  }
}
