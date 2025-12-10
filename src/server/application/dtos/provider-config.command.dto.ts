/**
 * Command DTOs (Input)
 *
 * These represent the input data for each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetProviderConfigCommand {
  userId: number;
  provider: string; // 'trakt' | 'mdblist'
}

export interface UpdateProviderConfigCommand {
  userId: number;
  provider: string;
  config: {
    clientId?: string; // Trakt
    apiKey?: string;   // MDBList
  };
}

export interface DeleteProviderConfigCommand {
  userId: number;
  provider: string;
}
