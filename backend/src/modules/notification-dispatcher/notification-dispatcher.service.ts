/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';

import { SocketGateway } from '../socket/socket.gateway';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationDispatcherService {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly emailService: EmailService,
  ) {}

  async dispatch(data: {
    notification: any;

    recipientEmail?: string;

    recipientName?: string;

    senderName?: string;
  }) {
    /**
     * 1. Realtime Socket
     */
    this.socketGateway.sendNotification(
      data.notification.recipientId,
      data.notification,
    );

    /**
     * 2. Email
     *
     * Later this becomes:
     *
     * emailQueue.add(...)
     */
    if (data.recipientEmail) {
      await this.emailService.sendTaskAssignedEmail({
        to: data.recipientEmail,

        recipientName: data.recipientName ?? 'User',

        senderName: data.senderName ?? 'Someone',

        taskTitle: data.notification.message,
      });
    }
  }
}
