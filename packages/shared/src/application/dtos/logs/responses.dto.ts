/**
 * Logs Response DTOs
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  module?: string;
  msg: string;
  data?: Record<string, unknown>;
}

export interface GetLogsResponse {
  logs: LogEntry[];
}

export interface ClearLogsResponse {
  success: boolean;
}
