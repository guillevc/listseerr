/**
 * Command DTOs (Input)
 *
 * These represent the input data for each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetJellyseerrConfigCommand {
  userId: number;
}

export interface UpdateJellyseerrConfigCommand {
  userId: number;
  data: {
    url: string;
    apiKey: string;
    userIdJellyseerr: number;
  };
}

export interface DeleteJellyseerrConfigCommand {
  userId: number;
}
