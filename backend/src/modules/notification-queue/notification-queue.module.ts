import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { EmailModule } from '../email/email.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [EmailModule, QueueModule],
  providers: [NotificationProcessor],
  exports: [NotificationProcessor],
})
export class NotificationQueueModule {}
