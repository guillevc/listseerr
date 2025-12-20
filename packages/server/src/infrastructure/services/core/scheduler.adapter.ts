import type {
  ISchedulerService,
  ScheduledJob,
} from '@/server/application/services/core/scheduler.service.interface';
import { Cron } from 'croner';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import { generalSettings } from '@/server/infrastructure/db/schema';
import { LoggerService } from './logger.adapter';
import * as schema from '@/server/infrastructure/db/schema';

const logger = new LoggerService('scheduler');

interface SchedulerJob {
  listId: number;
  cronJob: Cron;
}

class Scheduler {
  private jobs: Map<number, SchedulerJob> = new Map();
  private db: BunSQLiteDatabase<typeof schema> | null = null;
  private processAllListsCallback: (() => Promise<void>) | null = null;
  private timezone: string = 'UTC';

  // Job ID for global automatic processing
  private readonly GLOBAL_PROCESSING_JOB_ID = 0;

  initialize(
    db: BunSQLiteDatabase<typeof schema>,
    processAllListsCallback: () => Promise<void>,
    timezone: string
  ) {
    this.db = db;
    this.processAllListsCallback = processAllListsCallback;
    this.timezone = timezone;
    logger.info({ timezone }, 'Scheduler initialized');
  }

  async loadScheduledLists() {
    if (!this.db) {
      logger.error('Scheduler not initialized - database connection missing');
      return;
    }

    try {
      // Clear all existing jobs before reloading
      this.unscheduleAll();

      // Get automatic processing settings (timezone comes from env.TZ)
      const [settings] = await this.db
        .select()
        .from(generalSettings)
        .where(eq(generalSettings.userId, 1))
        .limit(1);

      const automaticProcessingEnabled = settings?.automaticProcessingEnabled || false;
      const automaticProcessingSchedule = settings?.automaticProcessingSchedule;

      logger.info({ timezone: this.timezone }, 'Using timezone for scheduled jobs');

      // Schedule global automatic processing if enabled
      if (automaticProcessingEnabled && automaticProcessingSchedule) {
        logger.info(
          {
            schedule: automaticProcessingSchedule,
            timezone: this.timezone,
          },
          'Scheduling global automatic processing - all enabled lists will be processed sequentially'
        );

        this.scheduleGlobalProcessing(automaticProcessingSchedule);

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

  scheduleGlobalProcessing(cronExpression: string) {
    // Remove existing global job if any
    this.unscheduleList(this.GLOBAL_PROCESSING_JOB_ID);

    if (!this.processAllListsCallback) {
      logger.error('Process all callback not set');
      return;
    }

    try {
      const cronOptions: { timezone: string; name: string } = {
        timezone: this.timezone,
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
          timezone: this.timezone,
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

class SchedulerServiceAdapter implements ISchedulerService {
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

// Singleton instance of the scheduler service adapter
export const schedulerService = new SchedulerServiceAdapter();
