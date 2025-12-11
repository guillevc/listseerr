/**
 * Logs Response DTOs
 *
 * Output contracts for logs-related operations.
 */

export interface LogEntryDTO {
  id: string;
  timestamp: string;
  level: string;
  module?: string;
  msg: string;
  data?: Record<string, unknown>;
}

export interface GetLogsResponse {
  logs: LogEntryDTO[];
}

export interface ClearLogsResponse {
  success: boolean;
}
