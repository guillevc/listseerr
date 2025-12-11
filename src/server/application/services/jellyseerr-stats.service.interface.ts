/**
 * Jellyseerr Stats Service Interface
 *
 * Service for fetching statistics from Jellyseerr API.
 * Wraps external HTTP calls behind an interface.
 *
 * Follows Dependency Inversion Principle:
 * - Interface defined in Application layer
 * - Implementation in Infrastructure layer
 */

export interface JellyseerrConfigDTO {
  url: string;
  apiKey: string;
  userIdJellyseerr: number;
}

export interface IJellyseerrStatsService {
  /**
   * Get count of pending requests in Jellyseerr
   * @throws Error if API call fails
   */
  getPendingRequestsCount(config: JellyseerrConfigDTO): Promise<number>;
}
