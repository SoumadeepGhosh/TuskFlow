import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { EmailService, TaskAssignedEmailData } from '../email/email.service';
import { NOTIFICATIONS_QUEUE } from '../queue/queue.service';

@Injectable()
export class NotificationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string | undefined>('redis.password');

    this.worker = new Worker(
      NOTIFICATIONS_QUEUE,
      async (job: Job) => {
        this.logger.log(`Processing job ${job.id} of type "${job.name}"`);

        switch (job.name) {
          case 'task-assigned':
            await this.handleTaskAssigned(job.data as TaskAssignedEmailData);
            break;
          default:
            this.logger.warn(`Unknown job name: ${job.name}`);
        }
      },
      {
        connection: {
          host,
          port,
          password: password || undefined,
        },
      },
    );

    this.worker.on('completed', (job: Job) => {
      this.logger.log(`Job ${job.id} (${job.name}) completed successfully`);
    });

    this.worker.on('failed', (job: Job | undefined, err: Error) => {
      this.logger.error(
        `Job ${job?.id} (${job?.name}) failed: ${err.message}`,
        err.stack,
      );
    });

    this.logger.log(`NotificationProcessor worker started for "${NOTIFICATIONS_QUEUE}"`);
  }

  private async handleTaskAssigned(data: TaskAssignedEmailData) {
    await this.emailService.sendTaskAssignedEmail(data);
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('NotificationProcessor worker closed');
    }
  }
}
