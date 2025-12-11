/**
 * Logs Commands DTOs
 */

export interface GetLogsCommand {
  userId?: number;
  limit: number;
  level: 'all' | 'debug' | 'info' | 'warn' | 'error';
}

export interface ClearLogsCommand {
  userId?: number;
}
