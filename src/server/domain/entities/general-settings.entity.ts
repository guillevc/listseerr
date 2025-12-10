import type { GeneralSettingsProps } from '../types/general-settings.types';
import type { GeneralSettingsDTO } from '../../application/dtos/general-settings.response.dto';
import type { Nullable } from '../../../shared/types';
import { Timezone } from '../value-objects/timezone.value-object';

/**
 * GeneralSettings Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Mutation methods enforce business rules (behavioral)
 * - toDTO() method for crossing application boundary
 *
 * Entities are mutable through their behavioral methods,
 * not through direct property access.
 */
export class GeneralSettings {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private _timezone: Timezone;
  private _automaticProcessingEnabled: boolean;
  private _automaticProcessingSchedule: Nullable<string>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: GeneralSettingsProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._timezone = props.timezone;
    this._automaticProcessingEnabled = props.automaticProcessingEnabled;
    this._automaticProcessingSchedule = props.automaticProcessingSchedule;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // Getters - expose state for read access
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get timezone(): Timezone {
    return this._timezone;
  }

  get automaticProcessingEnabled(): boolean {
    return this._automaticProcessingEnabled;
  }

  get automaticProcessingSchedule(): Nullable<string> {
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
   * Change the timezone
   * Accepts a validated Timezone Value Object
   */
  changeTimezone(newTimezone: Timezone): void {
    this._timezone = newTimezone;
    this._updatedAt = new Date();
  }

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
  changeSchedule(newSchedule: Nullable<string>): void {
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
      !!this._automaticProcessingSchedule &&
      this._automaticProcessingSchedule.trim().length > 0
    );
  }

  /**
   * Determine if scheduler needs to be reloaded based on changes
   * Scheduler reload is required when timezone, enabled state, or schedule changes
   */
  requiresSchedulerReload(changes: {
    timezone?: unknown;
    automaticProcessingEnabled?: unknown;
    automaticProcessingSchedule?: unknown;
  }): boolean {
    return (
      changes.automaticProcessingEnabled !== undefined ||
      changes.automaticProcessingSchedule !== undefined ||
      changes.timezone !== undefined
    );
  }

  /**
   * Check if automatic processing can be enabled
   * Automatic processing requires a valid schedule
   */
  canEnableAutomaticProcessing(): boolean {
    return this.hasValidSchedule();
  }

  /**
   * Convert entity to DTO for crossing application boundary
   * This is the ONLY way entities should leave the domain layer
   */
  toDTO(): GeneralSettingsDTO {
    return {
      id: this._id,
      userId: this._userId,
      timezone: this._timezone.getValue(),
      automaticProcessingEnabled: this._automaticProcessingEnabled,
      automaticProcessingSchedule: this._automaticProcessingSchedule,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
