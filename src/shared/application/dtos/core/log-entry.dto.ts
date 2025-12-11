/**
 * LogEntry Core DTO
 *
 * Represents a single log entry from the in-memory buffer.
 * Contains only primitives.
 *
 * Used by:
 * - Log buffer service
 * - Logs use cases
 * - tRPC router outputs
 */
export interface LogEntryDTO {
  id: string;
  timestamp: string;
  level: string;
  module?: string;
  msg: string;
  data?: Record<string, unknown>;
}
