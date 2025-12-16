/**
 * Log Buffer Service Interface (Port)
 *
 * Abstraction for in-memory log storage.
 * Follows Dependency Inversion Principle - Application layer defines interface,
 * Infrastructure layer provides implementation.
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  module?: string;
  msg: string;
  data?: Record<string, unknown>;
}

export interface ILogBufferService {
  /**
   * Get logs with optional filtering
   * @param limit - Maximum number of logs to return
   * @param level - Optional log level filter ('all', 'debug', 'info', 'warn', 'error')
   */
  getLogs(limit: number, level?: string): LogEntry[];

  /**
   * Clear all logs from buffer
   */
  clear(): void;
}
