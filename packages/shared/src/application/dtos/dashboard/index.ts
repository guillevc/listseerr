export * from './commands.dto';
export * from './responses.dto';

// Re-export ActivityGroup from core for backwards compatibility
export type { ActivityGroup } from '../core/execution.dto';
