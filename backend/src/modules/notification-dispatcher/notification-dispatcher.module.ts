import { Module } from '@nestjs/common';

import { SocketModule } from '../socket/socket.module';
import { EmailModule } from '../email/email.module';

import { NotificationDispatcherService } from './notification-dispatcher.service';

@Module({
  imports: [SocketModule, EmailModule],

  providers: [NotificationDispatcherService],

  exports: [NotificationDispatcherService],
})
export class NotificationDispatcherModule {}
