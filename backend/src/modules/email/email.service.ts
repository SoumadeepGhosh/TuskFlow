/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Test Email
   */
  async sendTestEmail(to: string) {
    return this.mailerService.sendMail({
      to,
      subject: 'TaskFlow Email Test ✅',
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>🎉 TaskFlow Email Test</h2>

          <p>Your email integration is working successfully.</p>

          <hr>

          <p><b>Time:</b> ${new Date().toLocaleString()}</p>

          <p>Regards,<br><b>TaskFlow</b></p>
        </div>
      `,
    });
  }

  /**
   * Task Assigned Email
   */
  async sendTaskAssignedEmail(data: {
    to: string;
    recipientName: string;
    senderName: string;
    taskTitle: string;
  }) {
    return this.mailerService.sendMail({
      to: data.to,

      subject: `📋 New Task Assigned - ${data.taskTitle}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">

          <h2>📋 New Task Assigned</h2>

          <p>Hello <b>${data.recipientName}</b>,</p>

          <p>
            <b>${data.senderName}</b> has assigned you a new task.
          </p>

          <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0;">
            <strong>Task:</strong><br/>
            ${data.taskTitle}
          </div>

          <p>
            Please login to <b>TaskFlow</b> to view and start working on it.
          </p>

          <br/>

          <p>
            Regards,<br/>
            <b>TaskFlow Team</b>
          </p>

        </div>
      `,
    });
  }
}
