/**
 * Service interface for testing Seerr connection (Port)
 *
 * Abstracts external HTTP calls to Seerr API.
 * Implementation is in the infrastructure layer.
 */
export interface ISeerrConnectionTester {
  /**
   * Test connection to Seerr instance
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
