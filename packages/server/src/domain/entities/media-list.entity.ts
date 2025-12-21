import { ListNameVO } from '@/server/domain/value-objects/list-name.vo';
import { ListUrlVO } from '@/server/domain/value-objects/list-url.vo';
import { ProviderVO } from '@/server/domain/value-objects/provider.vo';
import { InvalidMaxItemsError } from 'shared/domain/errors';
import type { ProviderType } from 'shared/domain/types';

/**
 * MediaList Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Mutation methods enforce business rules (behavioral)
 * - Value Objects for domain concepts (ListName, ListUrl, Provider)
 * - Mappers in Application layer convert to DTOs
 *
 * Entities are mutable through their behavioral methods,
 * not through direct property access.
 */
export class MediaList {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private _name: ListNameVO;
  private _url: ListUrlVO;
  private _displayUrl: string;
  private _provider: ProviderVO;
  private _enabled: boolean;
  private _maxItems: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    name: ListNameVO;
    url: ListUrlVO;
    displayUrl: string;
    provider: ProviderVO;
    enabled: boolean;
    maxItems: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._name = params.name;
    this._url = params.url;
    this._displayUrl = params.displayUrl;
    this._provider = params.provider;
    this._enabled = params.enabled;
    this._maxItems = params.maxItems;
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

  get name(): ListNameVO {
    return this._name;
  }

  get url(): ListUrlVO {
    return this._url;
  }

  get displayUrl(): string {
    return this._displayUrl;
  }

  get provider(): ProviderVO {
    return this._provider;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get maxItems(): number {
    return this._maxItems;
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
    this._name = ListNameVO.create(newName);
    this._updatedAt = new Date();
  }

  /**
   * Change the list URL
   * Validates the new URL via ListUrl VO
   */
  changeUrl(newUrl: string): void {
    this._url = ListUrlVO.create(newUrl);
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
   * Receives already-validated ProviderType from schema
   */
  changeProvider(newProvider: ProviderType): void {
    this._provider = ProviderVO.create(newProvider);
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
      throw new InvalidMaxItemsError(newMaxItems);
    }
    this._maxItems = newMaxItems;
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
   * Validate max items is within acceptable range
   */
  isMaxItemsValid(): boolean {
    return this._maxItems > 0 && this._maxItems <= 50;
  }
}
