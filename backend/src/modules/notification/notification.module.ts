import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';

import { NotificationDispatcherModule } from '../notification-dispatcher/notification-dispatcher.module';

@Module({
  imports: [NotificationDispatcherModule],

  controllers: [NotificationController],

  providers: [NotificationService, NotificationRepository],

  exports: [NotificationService],
})
export class NotificationModule {}
