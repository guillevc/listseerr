import { Cron } from 'croner';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, and } from 'drizzle-orm';
import { mediaLists, generalSettings } from '../db/schema';
import { createLogger } from './logger';

const logger = createLogger('scheduler');

interface ScheduledJob {
  listId: number;
  cronJob: Cron;
}

class Scheduler {
  private jobs: Map<number, ScheduledJob> = new Map();
  private db: BunSQLiteDatabase<Record<string, never>> | null = null;
  private processListCallback: ((listId: number) => Promise<void>) | null = null;

  initialize(
    db: BunSQLiteDatabase<Record<string, never>>,
    processListCallback: (listId: number) => Promise<void>
  ) {
    this.db = db;
    this.processListCallback = processListCallback;
    logger.info('Scheduler initialized');
  }

  async loadScheduledLists() {
    if (!this.db) {
      logger.error('Scheduler not initialized - database connection missing');
      return;
    }

    try {
      // Get timezone from settings
      const [settings] = await this.db
        .select()
        .from(generalSettings)
        .where(eq(generalSettings.userId, 1))
        .limit(1);

      const timezone = settings?.timezone || 'UTC';
      logger.info({ timezone }, 'Using timezone for scheduled jobs');

      // Get all enabled lists with schedules
      const lists = await this.db
        .select()
        .from(mediaLists)
        .where(
          and(
            eq(mediaLists.enabled, true),
            // Check if processingSchedule is not null
          )
        );

      const scheduledLists = lists.filter((list) => list.processingSchedule);

      logger.info(
        { count: scheduledLists.length },
        'Loading scheduled lists'
      );

      // Schedule each list
      for (const list of scheduledLists) {
        if (list.processingSchedule) {
          this.scheduleList(list.id, list.processingSchedule, timezone);
        }
      }

      logger.info(
        { activeJobs: this.jobs.size },
        'Scheduled jobs loaded successfully'
      );
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

      const cronOptions: any = {
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
        logger.info(
          { listId, cronExpression },
          'Cron job triggered - processing list'
        );

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
    for (const [listId, job] of this.jobs) {
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
