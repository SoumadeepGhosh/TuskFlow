import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { SocketModule } from '../socket/socket.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SocketModule, EmailModule],

  controllers: [NotificationController],

  providers: [NotificationService, NotificationRepository],

  exports: [NotificationService],
})
export class NotificationModule {}
