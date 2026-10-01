import { Injectable, Logger } from '@nestjs/common';
import { SocketService } from '../socket/socket.service';
import { QueueService } from '../queue/queue.service';
import { TaskAssignedEmailData } from '../email/email.service';

export interface DispatchNotificationPayload<T = unknown> {
  recipientId: number;
  notification: T;
  emailData?: TaskAssignedEmailData;
}

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly socketService: SocketService,
    private readonly queueService: QueueService,
  ) {}

  async dispatch<T>(payload: DispatchNotificationPayload<T>): Promise<void> {
    try {
      // 1. Deliver in realtime via Socket.IO
      this.socketService.emitNotification(payload.recipientId, payload.notification);
      this.logger.log(`Dispatched realtime socket notification to user:${payload.recipientId}`);

      // 2. Queue email in background if email data provided
      if (payload.emailData) {
        await this.queueService.addNotificationJob('task-assigned', payload.emailData);
        this.logger.log(`Enqueued task-assigned email for user:${payload.recipientId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to dispatch notification to user:${payload.recipientId}`,
        error,
      );
    }
  }
}
