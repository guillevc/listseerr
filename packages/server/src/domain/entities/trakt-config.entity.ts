import type { TraktClientIdVO } from 'shared/domain/value-objects/trakt-client-id.vo';

/**
 * TraktConfig Entity
 *
 * Represents Trakt API configuration for a user.
 * Follows DDD principles with private state and mutation methods.
 */
export class TraktConfig {
  private readonly _id: number;
  private readonly _userId: number;
  private _clientId: TraktClientIdVO;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: number;
    userId: number;
    clientId: TraktClientIdVO;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._clientId = params.clientId;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  static create(params: { userId: number; clientId: TraktClientIdVO }): TraktConfig {
    return new TraktConfig({
      id: 0,
      userId: params.userId,
      clientId: params.clientId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  updateClientId(clientId: TraktClientIdVO): void {
    this._clientId = clientId;
    this._updatedAt = new Date();
  }

  get id(): number {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get clientId(): TraktClientIdVO {
    return this._clientId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
