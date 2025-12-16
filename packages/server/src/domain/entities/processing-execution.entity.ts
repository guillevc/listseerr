import { ExecutionStatusVO } from 'shared/domain/value-objects/execution-status.vo';
import { TriggerTypeVO } from 'shared/domain/value-objects/trigger-type.vo';
import { BatchIdVO } from 'shared/domain/value-objects/batch-id.vo';
import { InvalidExecutionStatusTransitionError } from 'shared/domain/errors/processing.errors';
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
  private readonly _batchId: BatchIdVO;
  private _status: ExecutionStatusVO;
  private readonly _triggerType: TriggerTypeVO;
  private readonly _startedAt: Date;
  private _completedAt: Date | null;
  private _itemsFound: number;
  private _itemsRequested: number;
  private _itemsFailed: number;
  private _itemsSkippedAvailable: number;
  private _itemsSkippedPreviouslyRequested: number;
  private _errorMessage: string | null;

  constructor(params: {
    id: number;
    listId: number;
    batchId: BatchIdVO;
    status: ExecutionStatusVO;
    triggerType: TriggerTypeVO;
    startedAt: Date;
    completedAt: Date | null;
    itemsFound: number;
    itemsRequested: number;
    itemsFailed: number;
    itemsSkippedAvailable: number;
    itemsSkippedPreviouslyRequested: number;
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
    this._itemsSkippedAvailable = params.itemsSkippedAvailable;
    this._itemsSkippedPreviouslyRequested = params.itemsSkippedPreviouslyRequested;
    this._errorMessage = params.errorMessage;
  }

  /**
   * Factory method for creating a new execution (not yet persisted)
   */
  static create(props: {
    listId: number;
    batchId: BatchIdVO;
    triggerType: TriggerTypeVO;
  }): ProcessingExecution {
    return new ProcessingExecution({
      id: 0, // Will be set by repository on save
      listId: props.listId,
      batchId: props.batchId,
      status: ExecutionStatusVO.running(),
      triggerType: props.triggerType,
      startedAt: new Date(),
      completedAt: null,
      itemsFound: 0,
      itemsRequested: 0,
      itemsFailed: 0,
      itemsSkippedAvailable: 0,
      itemsSkippedPreviouslyRequested: 0,
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

  get batchId(): BatchIdVO {
    return this._batchId;
  }

  get status(): ExecutionStatusVO {
    return this._status;
  }

  get triggerType(): TriggerTypeVO {
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

  get itemsSkippedAvailable(): number {
    return this._itemsSkippedAvailable;
  }

  get itemsSkippedPreviouslyRequested(): number {
    return this._itemsSkippedPreviouslyRequested;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  // Business methods

  /**
   * Mark execution as successfully completed
   * @throws InvalidExecutionStatusTransitionError if already completed
   */
  markAsSuccess(
    itemsFound: number,
    itemsRequested: number,
    itemsFailed: number,
    itemsSkippedAvailable: number,
    itemsSkippedPreviouslyRequested: number
  ): void {
    if (this._status.isCompleted()) {
      throw new InvalidExecutionStatusTransitionError(this._status.getValue(), 'success');
    }

    this._status = ExecutionStatusVO.success();
    this._completedAt = new Date();
    this._itemsFound = itemsFound;
    this._itemsRequested = itemsRequested;
    this._itemsFailed = itemsFailed;
    this._itemsSkippedAvailable = itemsSkippedAvailable;
    this._itemsSkippedPreviouslyRequested = itemsSkippedPreviouslyRequested;
    this._errorMessage = null;
  }

  /**
   * Mark execution as failed with error message
   * @throws InvalidExecutionStatusTransitionError if already completed
   */
  markAsError(errorMessage: string): void {
    if (this._status.isCompleted()) {
      throw new InvalidExecutionStatusTransitionError(this._status.getValue(), 'error');
    }

    this._status = ExecutionStatusVO.error();
    this._completedAt = new Date();
    this._errorMessage = errorMessage;
    this._itemsFound = 0;
    this._itemsRequested = 0;
    this._itemsFailed = 0;
    this._itemsSkippedAvailable = 0;
    this._itemsSkippedPreviouslyRequested = 0;
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
}
