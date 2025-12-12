import type { ILogger } from '../../../application/services/logger.interface';
import type { Logger } from 'pino';
import pino from 'pino';
import { logBuffer } from '../adapters/log-buffer.adapter';
import { env } from '../../../env';

const isProduction = env.NODE_ENV === 'production';

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

const logger = pino(
  {
    level: env.LOG_LEVEL,
  },
  logStream
);

// Create child loggers for different modules
export const createLogger = (module: string): Logger => {
  return logger.child({ module });
};

export class LoggerService implements ILogger {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = createLogger(context);
  }

  info(message: string): void;
  info(obj: object, message: string): void;
  info(objOrMessage: object | string, message?: string): void {
    if (typeof objOrMessage === 'string') {
      this.logger.info(objOrMessage);
    } else {
      this.logger.info(objOrMessage, message!);
    }
  }

  error(message: string): void;
  error(obj: object, message: string): void;
  error(objOrMessage: object | string, message?: string): void {
    if (typeof objOrMessage === 'string') {
      this.logger.error(objOrMessage);
    } else {
      this.logger.error(objOrMessage, message!);
    }
  }

  debug(message: string): void;
  debug(obj: object, message: string): void;
  debug(objOrMessage: object | string, message?: string): void {
    if (typeof objOrMessage === 'string') {
      this.logger.debug(objOrMessage);
    } else {
      this.logger.debug(objOrMessage, message!);
    }
  }

  warn(message: string): void;
  warn(obj: object, message: string): void;
  warn(objOrMessage: object | string, message?: string): void {
    if (typeof objOrMessage === 'string') {
      this.logger.warn(objOrMessage);
    } else {
      this.logger.warn(objOrMessage, message!);
    }
  }
}
