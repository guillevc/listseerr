/**
 * Logs Command DTOs
 *
 * Input contracts for logs-related operations.
 */

export interface GetLogsCommand {
  userId: number;
  limit: number;
  level: 'all' | 'debug' | 'info' | 'warn' | 'error';
}

export interface ClearLogsCommand {
  userId: number;
}
