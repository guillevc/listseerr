import pino from 'pino';
import { logBuffer } from './log-buffer';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger Configuration
 *
 * Timestamps:
 * - Console logs: Uses system timezone (SYS:standard)
 * - In-memory logs: Stored in UTC (industry standard)
 * - UI Logs page: Converts UTC to user's configured timezone
 *
 * If console timestamps don't match your configured timezone,
 * set your system timezone to match: `sudo timedatectl set-timezone Europe/Madrid`
 */

// Custom stream that captures logs for the buffer
const logStream = pino.multistream([
  // Pretty print for console
  !isProduction
    ? {
        level: 'debug',
        stream: pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }),
      }
    : { level: 'info', stream: process.stdout },
  // Capture for in-memory buffer (timestamps stored in UTC)
  {
    level: 'debug',
    stream: {
      write: (msg: string) => {
        try {
          const logObject = JSON.parse(msg);
          logBuffer.addLog(logObject);
        } catch {
          // Ignore parsing errors
        }
      },
    },
  },
]);

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'debug',
  },
  logStream
);

// Create child loggers for different modules
export const createLogger = (module: string) => {
  return logger.child({ module });
};
