/**
 * GeneralSettings Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Mutation methods enforce business rules (behavioral)
 * - Mappers in Application layer convert to DTOs
 *
 * Entities are mutable through their behavioral methods,
 * not through direct property access.
 *
 * Note: Timezone is configured via TZ environment variable, not stored in DB.
 */
export class GeneralSettings {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private _automaticProcessingEnabled: boolean;
  private _automaticProcessingSchedule: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    automaticProcessingEnabled: boolean;
    automaticProcessingSchedule: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._automaticProcessingEnabled = params.automaticProcessingEnabled;
    this._automaticProcessingSchedule = params.automaticProcessingSchedule;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  /**
   * Factory for new entities with default values
   * Uses id: 0 for unpersisted entities (New Entity Convention)
   *
   * Defaults:
   * - automaticProcessingEnabled: true
   * - automaticProcessingSchedule: '0 4 * * *' (daily at 4:00 AM)
   */
  static create(userId: number): GeneralSettings {
    return new GeneralSettings({
      id: 0,
      userId,
      automaticProcessingEnabled: true,
      automaticProcessingSchedule: '0 4 * * *',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters - expose state for read access
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get automaticProcessingEnabled(): boolean {
    return this._automaticProcessingEnabled;
  }

  get automaticProcessingSchedule(): string | null {
    return this._automaticProcessingSchedule;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Mutation methods - behavioral API for changing state

  /**
   * Enable automatic processing
   */
  enableAutomaticProcessing(): void {
    this._automaticProcessingEnabled = true;
    this._updatedAt = new Date();
  }

  /**
   * Disable automatic processing
   */
  disableAutomaticProcessing(): void {
    this._automaticProcessingEnabled = false;
    this._updatedAt = new Date();
  }

  /**
   * Change the automatic processing schedule
   * Accepts null to clear the schedule
   */
  changeSchedule(newSchedule: string | null): void {
    this._automaticProcessingSchedule = newSchedule;
    this._updatedAt = new Date();
  }

  // Business logic methods - domain rules

  /**
   * Check if the settings have a valid schedule configured
   * A schedule is valid if it's not null and not empty
   */
  hasValidSchedule(): boolean {
    return (
      !!this._automaticProcessingSchedule && this._automaticProcessingSchedule.trim().length > 0
    );
  }

  /**
   * Determine if scheduler needs to be reloaded based on changes
   * Scheduler reload is required when enabled state or schedule changes
   * Note: Timezone changes require app restart (env var)
   */
  requiresSchedulerReload(changes: {
    automaticProcessingEnabled?: unknown;
    automaticProcessingSchedule?: unknown;
  }): boolean {
    return (
      changes.automaticProcessingEnabled !== undefined ||
      changes.automaticProcessingSchedule !== undefined
    );
  }

  /**
   * Check if automatic processing can be enabled
   * Automatic processing requires a valid schedule
   */
  canEnableAutomaticProcessing(): boolean {
    return this.hasValidSchedule();
  }
}
