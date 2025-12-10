import type { ILogger } from '../../application/services/logger.interface';
import { createLogger } from '../../lib/logger';
import type { Logger } from 'pino';

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
