import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

export const NOTIFICATIONS_QUEUE = 'notifications';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private notificationsQueue!: Queue;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string | undefined>(
      'redis.password',
    );

    this.notificationsQueue = new Queue(NOTIFICATIONS_QUEUE, {
      connection: {
        host,
        port,
        password: password || undefined,
      },
    });

    this.logger.log(`Initialized BullMQ queue "${NOTIFICATIONS_QUEUE}"`);
  }

  async addNotificationJob<T = unknown>(name: string, data: T) {
    try {
      const job = await this.notificationsQueue.add(name, data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      });

      this.logger.log(
        `Added job ${job.id} (${name}) to ${NOTIFICATIONS_QUEUE}`,
      );
      return job;
    } catch (error) {
      this.logger.error(
        `Failed to add job (${name}) to ${NOTIFICATIONS_QUEUE}`,
        error,
      );
      throw error;
    }
  }

  getNotificationsQueue(): Queue {
    return this.notificationsQueue;
  }

  async onModuleDestroy() {
    if (this.notificationsQueue) {
      await this.notificationsQueue.close();
      this.logger.log(`Closed BullMQ queue "${NOTIFICATIONS_QUEUE}"`);
    }
  }
}
