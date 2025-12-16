import type {
  ILogBufferService,
  LogEntry,
} from '@/server/application/services/core/log-buffer.service.interface';

class LogBuffer {
  private logs: LogEntry[] = [];
  private maxSize = 1000;
  private idCounter = 0;

  addLog(logObject: Record<string, unknown>) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${this.idCounter++}`,
      timestamp: new Date().toISOString(),
      level: this.getLevelName(logObject.level as number),
      module: logObject.module as string | undefined,
      msg: logObject.msg as string,
      data: this.extractData(logObject),
    };

    this.logs.unshift(entry);

    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(0, this.maxSize);
    }
  }

  getLogs(limit: number = 100, level?: string): LogEntry[] {
    let filtered = this.logs;

    if (level && level !== 'all') {
      const levelPriority = this.getLevelPriority(level);
      filtered = this.logs.filter((log) => this.getLevelPriority(log.level) >= levelPriority);
    }

    return filtered.slice(0, limit);
  }

  clear() {
    this.logs = [];
  }

  private getLevelName(level: number): string {
    const levels: Record<number, string> = {
      10: 'trace',
      20: 'debug',
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal',
    };
    return levels[level] || 'unknown';
  }

  private getLevelPriority(levelName: string): number {
    const priorities: Record<string, number> = {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60,
    };
    return priorities[levelName.toLowerCase()] || 0;
  }

  private extractData(logObject: Record<string, unknown>): Record<string, unknown> | undefined {
    const {
      level: _level,
      time: _time,
      pid: _pid,
      hostname: _hostname,
      module: _module,
      msg: _msg,
      ...rest
    } = logObject;

    if (Object.keys(rest).length === 0) {
      return undefined;
    }

    return rest;
  }
}

export const logBuffer = new LogBuffer();

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
