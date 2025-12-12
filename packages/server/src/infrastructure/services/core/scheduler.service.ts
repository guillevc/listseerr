import type {
  ISchedulerService,
  ScheduledJob,
} from '../../../application/services/scheduler.service.interface';
import { Cron } from 'croner';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import { generalSettings } from '../../db/schema';
import { createLogger } from './logger.service';
import * as schema from '../../db/schema';

const logger = createLogger('scheduler');

interface SchedulerJob {
  listId: number;
  cronJob: Cron;
}

class Scheduler {
  private jobs: Map<number, SchedulerJob> = new Map();
  private db: BunSQLiteDatabase<typeof schema> | null = null;
  private processListCallback: ((listId: number) => Promise<void>) | null = null;
  private processAllListsCallback: (() => Promise<void>) | null = null;

  // Special list ID for global automatic processing job
  private readonly GLOBAL_PROCESSING_JOB_ID = 0;

  initialize(
    db: BunSQLiteDatabase<typeof schema>,
    processListCallback: (listId: number) => Promise<void>,
    processAllListsCallback: () => Promise<void>
  ) {
    this.db = db;
    this.processListCallback = processListCallback;
    this.processAllListsCallback = processAllListsCallback;
    logger.info('Scheduler initialized');
  }

  async loadScheduledLists() {
    if (!this.db) {
      logger.error('Scheduler not initialized - database connection missing');
      return;
    }

    try {
      // Clear all existing jobs before reloading
      this.unscheduleAll();

      // Get timezone and automatic processing settings
      const [settings] = await this.db
        .select()
        .from(generalSettings)
        .where(eq(generalSettings.userId, 1))
        .limit(1);

      const timezone = settings?.timezone || 'UTC';
      const automaticProcessingEnabled = settings?.automaticProcessingEnabled || false;
      const automaticProcessingSchedule = settings?.automaticProcessingSchedule;

      logger.info({ timezone }, 'Using timezone for scheduled jobs');

      // Schedule global automatic processing if enabled
      if (automaticProcessingEnabled && automaticProcessingSchedule) {
        logger.info(
          {
            schedule: automaticProcessingSchedule,
            timezone,
          },
          'Scheduling global automatic processing - all enabled lists will be processed sequentially'
        );

        this.scheduleGlobalProcessing(automaticProcessingSchedule, timezone);

        logger.info(
          { activeJobs: this.jobs.size },
          'Global automatic processing scheduled successfully'
        );
      } else {
        logger.info('Global automatic processing is disabled');
      }
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to load scheduled lists'
      );
    }
  }

  scheduleList(listId: number, cronExpression: string, timezone: string = 'UTC') {
    // Remove existing job if any
    this.unscheduleList(listId);

    if (!this.processListCallback) {
      logger.error('Process callback not set');
      return;
    }

    try {
      // For interval-based crons (e.g., */6 * * * *), we want to start from server restart
      // Check if this is an interval-based cron by looking for */
      const isIntervalBased = cronExpression.includes('*/');

      const cronOptions: { timezone: string; name: string } = {
        timezone,
        name: `list-${listId}`,
      };

      // If interval-based, trigger immediately on schedule, then follow interval
      if (isIntervalBased) {
        logger.info(
          { listId, cronExpression },
          'Scheduling interval-based job (will run from server start)'
        );
      }

      const job = new Cron(cronExpression, cronOptions, async () => {
        logger.info({ listId, cronExpression }, 'Cron job triggered - processing list');

        try {
          if (this.processListCallback) {
            await this.processListCallback(listId);
          }
        } catch (error) {
          logger.error(
            {
              listId,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Error processing scheduled list'
          );
        }
      });

      this.jobs.set(listId, { listId, cronJob: job });

      const nextRun = job.nextRun();
      logger.info(
        {
          listId,
          cronExpression,
          timezone,
          nextRun: nextRun ? nextRun.toISOString() : 'N/A',
        },
        'List scheduled successfully'
      );
    } catch (error) {
      logger.error(
        {
          listId,
          cronExpression,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to schedule list'
      );
    }
  }

  scheduleGlobalProcessing(cronExpression: string, timezone: string = 'UTC') {
    // Remove existing global job if any
    this.unscheduleList(this.GLOBAL_PROCESSING_JOB_ID);

    if (!this.processAllListsCallback) {
      logger.error('Process all callback not set');
      return;
    }

    try {
      const cronOptions: { timezone: string; name: string } = {
        timezone,
        name: `global-processing`,
      };

      const job = new Cron(cronExpression, cronOptions, async () => {
        logger.info(
          { cronExpression },
          'Global automatic processing triggered - processing all enabled lists'
        );

        try {
          if (this.processAllListsCallback) {
            await this.processAllListsCallback();
          }
        } catch (error) {
          logger.error(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            'Error in global automatic processing'
          );
        }
      });

      this.jobs.set(this.GLOBAL_PROCESSING_JOB_ID, {
        listId: this.GLOBAL_PROCESSING_JOB_ID,
        cronJob: job,
      });

      const nextRun = job.nextRun();
      logger.info(
        {
          cronExpression,
          timezone,
          nextRun: nextRun ? nextRun.toISOString() : 'N/A',
        },
        'Global automatic processing scheduled successfully'
      );
    } catch (error) {
      logger.error(
        {
          cronExpression,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to schedule global automatic processing'
      );
    }
  }

  unscheduleList(listId: number) {
    const job = this.jobs.get(listId);
    if (job) {
      job.cronJob.stop();
      this.jobs.delete(listId);
      logger.info({ listId }, 'List unscheduled');
    }
  }

  unscheduleAll() {
    logger.info({ count: this.jobs.size }, 'Unscheduling all jobs');
    for (const job of this.jobs.values()) {
      job.cronJob.stop();
    }
    this.jobs.clear();
  }

  getScheduledJobs(): { listId: number; nextRun: string | null }[] {
    const jobs = [];
    for (const [listId, job] of this.jobs) {
      const nextRun = job.cronJob.nextRun();
      jobs.push({
        listId,
        nextRun: nextRun ? nextRun.toISOString() : null,
      });
    }
    return jobs;
  }

  isScheduled(listId: number): boolean {
    return this.jobs.has(listId);
  }
}

export const scheduler = new Scheduler();

export class SchedulerService implements ISchedulerService {
  async loadScheduledLists(): Promise<void> {
    await scheduler.loadScheduledLists();
  }

  unscheduleList(listId: number): void {
    scheduler.unscheduleList(listId);
  }

  getScheduledJobs(): ScheduledJob[] {
    const jobs = scheduler.getScheduledJobs();

    // Transform to richer DTO format
    return jobs.map((job) => ({
      name: `List ${job.listId}`,
      cronExpression: '', // Not available from current scheduler implementation
      nextRun: job.nextRun ? new Date(job.nextRun) : null,
      isRunning: false, // Not tracked in current scheduler implementation
    }));
  }
}
