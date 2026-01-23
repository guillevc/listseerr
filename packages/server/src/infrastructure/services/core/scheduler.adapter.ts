import type {
  ISchedulerService,
  ScheduledJob,
} from '@/server/application/services/core/scheduler.service.interface';
import { Cron } from 'croner';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import { generalSettings } from '@/server/infrastructure/db/schema';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import * as schema from '@/server/infrastructure/db/schema';

interface SchedulerJob {
  listId: number;
  cronJob: Cron;
}

export interface SchedulerDependencies {
  db: BunSQLiteDatabase<typeof schema>;
  processAllListsCallback: () => Promise<void>;
  timezone: string;
  logger: ILogger;
}

/**
 * Scheduler class that manages cron jobs for automatic list processing.
 * Accepts all dependencies through constructor for proper DI.
 */
export class Scheduler {
  private jobs: Map<number, SchedulerJob> = new Map();
  private readonly db: BunSQLiteDatabase<typeof schema>;
  private readonly processAllListsCallback: () => Promise<void>;
  private readonly timezone: string;
  private readonly logger: ILogger;

  // Job ID for global automatic processing
  private readonly GLOBAL_PROCESSING_JOB_ID = 0;

  constructor(deps: SchedulerDependencies) {
    this.db = deps.db;
    this.processAllListsCallback = deps.processAllListsCallback;
    this.timezone = deps.timezone;
    this.logger = deps.logger;
    this.logger.info({ timezone: this.timezone }, 'Scheduler initialized');
  }

  async loadScheduledLists() {
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

      this.logger.info({ timezone: this.timezone }, 'Using timezone for scheduled jobs');

      // Schedule global automatic processing if enabled
      if (automaticProcessingEnabled && automaticProcessingSchedule) {
        this.logger.info(
          {
            schedule: automaticProcessingSchedule,
            timezone: this.timezone,
          },
          'Scheduling global automatic processing - all enabled lists will be processed sequentially'
        );

        this.scheduleGlobalProcessing(automaticProcessingSchedule);

        this.logger.info(
          { activeJobs: this.jobs.size },
          'Global automatic processing scheduled successfully'
        );
      } else {
        this.logger.info('Global automatic processing is disabled');
      }
    } catch (error) {
      this.logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to load scheduled lists'
      );
    }
  }

  scheduleGlobalProcessing(cronExpression: string) {
    // Remove existing global job if any
    this.unscheduleList(this.GLOBAL_PROCESSING_JOB_ID);

    try {
      const cronOptions: { timezone: string; name: string } = {
        timezone: this.timezone,
        name: `global-processing`,
      };

      const job = new Cron(cronExpression, cronOptions, async () => {
        this.logger.info(
          { cronExpression },
          'Global automatic processing triggered - processing all enabled lists'
        );

        try {
          await this.processAllListsCallback();
        } catch (error) {
          this.logger.error(
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
      this.logger.info(
        {
          cronExpression,
          timezone: this.timezone,
          nextRun: nextRun ? nextRun.toISOString() : 'N/A',
        },
        'Global automatic processing scheduled successfully'
      );
    } catch (error) {
      this.logger.error(
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
      this.logger.info({ listId }, 'List unscheduled');
    }
  }

  unscheduleAll() {
    this.logger.info({ count: this.jobs.size }, 'Unscheduling all jobs');
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

/**
 * SchedulerServiceAdapter implements ISchedulerService interface
 * by delegating to the Scheduler instance injected via constructor.
 */
export class SchedulerServiceAdapter implements ISchedulerService {
  constructor(private readonly scheduler: Scheduler) {}

  async loadScheduledLists(): Promise<void> {
    await this.scheduler.loadScheduledLists();
  }

  unscheduleList(listId: number): void {
    this.scheduler.unscheduleList(listId);
  }

  getScheduledJobs(): ScheduledJob[] {
    const jobs = this.scheduler.getScheduledJobs();

    // Transform to richer DTO format
    return jobs.map((job) => ({
      name: `List ${job.listId}`,
      cronExpression: '', // Not available from current scheduler implementation
      nextRun: job.nextRun ? new Date(job.nextRun) : null,
      isRunning: false, // Not tracked in current scheduler implementation
    }));
  }
}

/**
 * LazySchedulerService implements ISchedulerService interface
 * by lazily resolving the actual scheduler service at runtime.
 * This allows containers to be created before the scheduler is initialized.
 */
export class LazySchedulerService implements ISchedulerService {
  constructor(private readonly getService: () => ISchedulerService) {}

  async loadScheduledLists(): Promise<void> {
    await this.getService().loadScheduledLists();
  }

  unscheduleList(listId: number): void {
    this.getService().unscheduleList(listId);
  }

  getScheduledJobs(): ScheduledJob[] {
    return this.getService().getScheduledJobs();
  }
}
