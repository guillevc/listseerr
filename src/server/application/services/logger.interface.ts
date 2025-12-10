export interface ILogger {
  info(message: string): void;
  info(obj: object, message: string): void;
  error(message: string): void;
  error(obj: object, message: string): void;
  debug(message: string): void;
  debug(obj: object, message: string): void;
  warn(message: string): void;
  warn(obj: object, message: string): void;
}
