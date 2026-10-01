import { Global, Module } from '@nestjs/common';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { SocketModule } from '../socket/socket.module';
import { QueueModule } from '../queue/queue.module';

@Global()
@Module({
  imports: [SocketModule, QueueModule],
  providers: [NotificationDispatcherService],
  exports: [NotificationDispatcherService],
})
export class NotificationDispatcherModule {}
