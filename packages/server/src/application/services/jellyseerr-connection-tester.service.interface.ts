/**
 * Service interface for testing Jellyseerr connection (Port)
 *
 * Abstracts external HTTP calls to Jellyseerr API.
 * Implementation is in the infrastructure layer.
 */
export interface IJellyseerrConnectionTester {
  /**
   * Test connection to Jellyseerr instance
   * Returns success status and message
   */
  testConnection(
    url: string,
    apiKey: string
  ): Promise<{
    success: boolean;
    message: string;
  }>;
}
