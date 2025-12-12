import type {
  ILogBufferService,
  LogEntry,
} from '../../application/services/log-buffer.service.interface';
import { logBuffer } from '../../lib/log-buffer';

/**
 * Log Buffer Service Adapter
 *
 * Wraps singleton logBuffer with ILogBufferService interface for dependency injection.
 * Follows Adapter pattern - adapts existing infrastructure to application interface.
 */
export class LogBufferAdapter implements ILogBufferService {
  getLogs(limit: number, level?: string): LogEntry[] {
    return logBuffer.getLogs(limit, level);
  }

  clear(): void {
    logBuffer.clear();
  }
}
