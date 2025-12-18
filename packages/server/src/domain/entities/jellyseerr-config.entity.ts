import { JellyseerrUrlVO } from '@/server/domain/value-objects/jellyseerr-url.vo';
import { JellyseerrExternalUrlVO } from '@/server/domain/value-objects/jellyseerr-external-url.vo';
import { JellyseerrApiKeyVO } from '@/server/domain/value-objects/jellyseerr-api-key.vo';
import { JellyseerrUserIdVO } from '@/server/domain/value-objects/jellyseerr-user-id.vo';
/**
 * JellyseerrConfig Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Mutation methods enforce business rules (behavioral)
 * - Mappers in Application layer convert to DTOs
 */
export class JellyseerrConfig {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private _url: JellyseerrUrlVO;
  private _externalUrl: JellyseerrExternalUrlVO | null;
  private _apiKey: JellyseerrApiKeyVO;
  private _userIdJellyseerr: JellyseerrUserIdVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    url: JellyseerrUrlVO;
    externalUrl: JellyseerrExternalUrlVO | null;
    apiKey: JellyseerrApiKeyVO;
    userIdJellyseerr: JellyseerrUserIdVO;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._url = params.url;
    this._externalUrl = params.externalUrl;
    this._apiKey = params.apiKey;
    this._userIdJellyseerr = params.userIdJellyseerr;
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

  get url(): JellyseerrUrlVO {
    return this._url;
  }

  get externalUrl(): JellyseerrExternalUrlVO | null {
    return this._externalUrl;
  }

  get apiKey(): JellyseerrApiKeyVO {
    return this._apiKey;
  }

  get userIdJellyseerr(): JellyseerrUserIdVO {
    return this._userIdJellyseerr;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Mutation methods - behavioral API for changing state

  /**
   * Change the Jellyseerr URL
   * Accepts primitive and creates VO internally for validation
   */
  changeUrl(newUrl: string): void {
    this._url = JellyseerrUrlVO.create(newUrl);
    this._updatedAt = new Date();
  }

  /**
   * Change the API key
   * Accepts primitive and creates VO internally for validation
   */
  changeApiKey(newApiKey: string): void {
    this._apiKey = JellyseerrApiKeyVO.create(newApiKey);
    this._updatedAt = new Date();
  }

  /**
   * Change the Jellyseerr user ID
   * Accepts primitive and creates VO internally for validation
   */
  changeJellyseerrUserId(newUserId: number): void {
    this._userIdJellyseerr = JellyseerrUserIdVO.create(newUserId);
    this._updatedAt = new Date();
  }

  /**
   * Change the external URL (user-facing URL for browser links)
   * Accepts primitive or null and creates VO internally for validation
   */
  changeExternalUrl(newExternalUrl: string | null): void {
    this._externalUrl = newExternalUrl ? JellyseerrExternalUrlVO.create(newExternalUrl) : null;
    this._updatedAt = new Date();
  }

  // Business logic methods - domain rules

  /**
   * Get API headers for Jellyseerr requests
   * Encapsulates header construction logic
   */
  getApiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this._apiKey.getValue(),
      'X-Api-User': this._userIdJellyseerr.getValue().toString(),
    };
  }

  /**
   * Get the status endpoint URL
   * Encapsulates endpoint construction logic
   */
  getStatusEndpoint(): string {
    return `${this._url.getValue()}/api/v1/status`;
  }
}
