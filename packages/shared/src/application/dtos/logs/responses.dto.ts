/**
 * Logs Response DTOs
 */

import type { LogEntryDTO } from '../core/log-entry.dto';

export interface GetLogsResponse {
  logs: LogEntryDTO[];
}

/**
 * @deprecated Use LogEntryDTO from '../core/log-entry.dto' instead
 */
export type LogEntry = LogEntryDTO;

export interface ClearLogsResponse {
  success: boolean;
}
