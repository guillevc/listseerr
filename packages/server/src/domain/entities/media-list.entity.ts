import { ListName } from 'shared/domain/value-objects/list-name.value-object';
import { ListUrl } from 'shared/domain/value-objects/list-url.value-object';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { ProviderType } from 'shared/domain/types/provider.types';
import type { MediaListDTO } from 'shared/application/dtos/core/media-list.dto';
import type { Nullable } from 'shared/domain/types/utility.types';

/**
 * MediaList Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Mutation methods enforce business rules (behavioral)
 * - Value Objects for domain concepts (ListName, ListUrl, Provider)
 * - toDTO() method for crossing application boundary
 *
 * Entities are mutable through their behavioral methods,
 * not through direct property access.
 */
export class MediaList {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private _name: ListName;
  private _url: ListUrl;
  private _displayUrl: string;
  private _provider: Provider;
  private _enabled: boolean;
  private _maxItems: number;
  private _processingSchedule: Nullable<string>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    name: string;
    url: string;
    displayUrl: string;
    provider: ProviderType;
    enabled: boolean;
    maxItems: number;
    processingSchedule: Nullable<string>;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._name = ListName.create(params.name);
    this._url = ListUrl.create(params.url);
    this._displayUrl = params.displayUrl;
    this._provider = Provider.create(params.provider);
    this._enabled = params.enabled;
    this._maxItems = params.maxItems;
    this._processingSchedule = params.processingSchedule;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  // Getters - expose state for read access
  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get name(): ListName {
    return this._name;
  }

  get url(): ListUrl {
    return this._url;
  }

  get displayUrl(): string {
    return this._displayUrl;
  }

  get provider(): Provider {
    return this._provider;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get maxItems(): number {
    return this._maxItems;
  }

  get processingSchedule(): Nullable<string> {
    return this._processingSchedule;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Mutation methods - behavioral API for changing state

  /**
   * Change the list name
   * Validates the new name via ListName VO
   */
  changeName(newName: string): void {
    this._name = ListName.create(newName);
    this._updatedAt = new Date();
  }

  /**
   * Change the list URL
   * Validates the new URL via ListUrl VO
   */
  changeUrl(newUrl: string): void {
    this._url = ListUrl.create(newUrl);
    this._updatedAt = new Date();
  }

  /**
   * Change the display URL (user-facing URL)
   */
  changeDisplayUrl(newDisplayUrl: string): void {
    this._displayUrl = newDisplayUrl;
    this._updatedAt = new Date();
  }

  /**
   * Change the provider
   * Validates the new provider via Provider VO
   */
  changeProvider(newProvider: ProviderType): void {
    this._provider = Provider.create(newProvider);
    this._updatedAt = new Date();
  }

  /**
   * Toggle enabled state
   */
  toggle(): void {
    this._enabled = !this._enabled;
    this._updatedAt = new Date();
  }

  /**
   * Enable the list
   */
  enable(): void {
    this._enabled = true;
    this._updatedAt = new Date();
  }

  /**
   * Disable the list
   */
  disable(): void {
    this._enabled = false;
    this._updatedAt = new Date();
  }

  /**
   * Change max items
   * Enforces business rule: 1 <= maxItems <= 50
   */
  changeMaxItems(newMaxItems: number): void {
    if (newMaxItems <= 0 || newMaxItems > 50) {
      throw new Error('Max items must be between 1 and 50');
    }
    this._maxItems = newMaxItems;
    this._updatedAt = new Date();
  }

  /**
   * Change processing schedule
   */
  changeSchedule(newSchedule: Nullable<string>): void {
    this._processingSchedule = newSchedule;
    this._updatedAt = new Date();
  }

  // Business logic methods - domain rules

  /**
   * Check if the list can be processed
   * A list is processable if it's enabled
   */
  isProcessable(): boolean {
    return this._enabled;
  }

  /**
   * Check if the list has a processing schedule configured
   */
  hasSchedule(): boolean {
    return !!this._processingSchedule;
  }

  /**
   * Validate max items is within acceptable range
   */
  isMaxItemsValid(): boolean {
    return this._maxItems > 0 && this._maxItems <= 50;
  }

  /**
   * Determine if scheduler needs to be reloaded based on changes
   * Scheduler reload is required when schedule or enabled state changes
   */
  requiresSchedulerReload(changes: { processingSchedule?: unknown; enabled?: unknown }): boolean {
    return changes.processingSchedule !== undefined || changes.enabled !== undefined;
  }

  /**
   * Convert entity to DTO for crossing application boundary
   * Unwraps all Value Objects to primitives
   * This is the ONLY way entities should leave the domain layer
   */
  toDTO(): MediaListDTO {
    return {
      id: this._id,
      userId: this._userId,
      name: this._name.getValue(), // Unwrap VO
      url: this._url.getValue(), // Unwrap VO
      displayUrl: this._displayUrl,
      provider: this._provider.getValue(), // Unwrap VO
      enabled: this._enabled,
      maxItems: this._maxItems,
      processingSchedule: this._processingSchedule, // Already string | null
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
