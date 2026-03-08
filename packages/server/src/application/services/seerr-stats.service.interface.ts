/**
 * Seerr Stats Service Interface
 *
 * Service for fetching statistics from Seerr API.
 * Wraps external HTTP calls behind an interface.
 *
 * Follows Dependency Inversion Principle:
 * - Interface defined in Application layer
 * - Implementation in Infrastructure layer
 */

export interface SeerrConfigDTO {
  url: string;
  apiKey: string;
  userIdSeerr: number;
}

export interface ISeerrStatsService {
  /**
   * Get count of pending requests in Seerr
   * @throws Error if API call fails
   */
  getPendingRequestsCount(config: SeerrConfigDTO): Promise<number>;
}
