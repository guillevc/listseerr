import type { IJellyseerrConnectionTester } from '../../../application/services/jellyseerr-connection-tester.service.interface';

export class HttpJellyseerrConnectionTester implements IJellyseerrConnectionTester {
  async testConnection(
    url: string,
    apiKey: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${url}/api/v1/status`, {
        headers: {
          'X-Api-Key': apiKey,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to connect: ${response.statusText}`,
        };
      }

      return {
        success: true,
        message: 'Connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
