import type { MdbListApiKeyVO } from '@/server/domain/value-objects/mdblist-api-key.vo';

/**
 * MdbListConfig Entity
 *
 * Represents MDBList API configuration for a user.
 * Follows DDD principles with private state and mutation methods.
 */
export class MdbListConfig {
  private readonly _id: number;
  private readonly _userId: number;
  private _apiKey: MdbListApiKeyVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    apiKey: MdbListApiKeyVO;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._apiKey = params.apiKey;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  static create(params: { userId: number; apiKey: MdbListApiKeyVO }): MdbListConfig {
    return new MdbListConfig({
      id: 0,
      userId: params.userId,
      apiKey: params.apiKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  updateApiKey(apiKey: MdbListApiKeyVO): void {
    this._apiKey = apiKey;
    this._updatedAt = new Date();
  }

  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get apiKey(): MdbListApiKeyVO {
    return this._apiKey;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
