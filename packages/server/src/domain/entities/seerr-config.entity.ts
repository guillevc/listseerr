import { SeerrUrlVO } from '@/server/domain/value-objects/seerr-url.vo';
import { SeerrExternalUrlVO } from '@/server/domain/value-objects/seerr-external-url.vo';
import { SeerrApiKeyVO } from '@/server/domain/value-objects/seerr-api-key.vo';
import { SeerrUserIdVO } from '@/server/domain/value-objects/seerr-user-id.vo';
import type { TvSeasonsPrimitive } from 'shared/domain/types';
/**
 * SeerrConfig Entity - Domain Model with Rich Behavior
 *
 * This entity follows DDD principles:
 * - Private state (encapsulation)
 * - Mutation methods enforce business rules (behavioral)
 * - Mappers in Application layer convert to DTOs
 */
export class SeerrConfig {
  // Private state - encapsulated
  private readonly _id: number;
  private readonly _userId: number;
  private _url: SeerrUrlVO;
  private _externalUrl: SeerrExternalUrlVO | null;
  private _apiKey: SeerrApiKeyVO;
  private _userIdSeerr: SeerrUserIdVO;
  private _tvSeasons: TvSeasonsPrimitive;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    url: SeerrUrlVO;
    externalUrl: SeerrExternalUrlVO | null;
    apiKey: SeerrApiKeyVO;
    userIdSeerr: SeerrUserIdVO;
    tvSeasons: TvSeasonsPrimitive;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._url = params.url;
    this._externalUrl = params.externalUrl;
    this._apiKey = params.apiKey;
    this._userIdSeerr = params.userIdSeerr;
    this._tvSeasons = params.tvSeasons;
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

  get url(): SeerrUrlVO {
    return this._url;
  }

  get externalUrl(): SeerrExternalUrlVO | null {
    return this._externalUrl;
  }

  get apiKey(): SeerrApiKeyVO {
    return this._apiKey;
  }

  get userIdSeerr(): SeerrUserIdVO {
    return this._userIdSeerr;
  }

  get tvSeasons(): TvSeasonsPrimitive {
    return this._tvSeasons;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Mutation methods - behavioral API for changing state

  /**
   * Change the Seerr URL
   * Accepts primitive and creates VO internally for validation
   */
  changeUrl(newUrl: string): void {
    this._url = SeerrUrlVO.create(newUrl);
    this._updatedAt = new Date();
  }

  /**
   * Change the API key
   * Accepts primitive and creates VO internally for validation
   */
  changeApiKey(newApiKey: string): void {
    this._apiKey = SeerrApiKeyVO.create(newApiKey);
    this._updatedAt = new Date();
  }

  /**
   * Change the Seerr user ID
   * Accepts primitive and creates VO internally for validation
   */
  changeSeerrUserId(newUserId: number): void {
    this._userIdSeerr = SeerrUserIdVO.create(newUserId);
    this._updatedAt = new Date();
  }

  /**
   * Change the external URL (user-facing URL for browser links)
   * Accepts primitive or null and creates VO internally for validation
   */
  changeExternalUrl(newExternalUrl: string | null): void {
    this._externalUrl = newExternalUrl ? SeerrExternalUrlVO.create(newExternalUrl) : null;
    this._updatedAt = new Date();
  }

  /**
   * Change the TV seasons request mode
   */
  changeTvSeasons(value: TvSeasonsPrimitive): void {
    this._tvSeasons = value;
    this._updatedAt = new Date();
  }

  // Business logic methods - domain rules

  /**
   * Get API headers for Seerr requests
   * Encapsulates header construction logic
   */
  getApiHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': this._apiKey.getValue(),
      'X-Api-User': this._userIdSeerr.getValue().toString(),
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
