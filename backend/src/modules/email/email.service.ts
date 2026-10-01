import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface TaskAssignedEmailData {
  recipientEmail: string;
  recipientName: string;
  taskTitle: string;
  taskId: number;
  assignedByName: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'localhost';
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: {
          user,
          pass,
        },
      });
    } else {
      // In development/test mode without credentials, create a stream/json transporter for logging
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendTaskAssignedEmail(data: TaskAssignedEmailData): Promise<void> {
    const subject = `You have been assigned to task: "${data.taskTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">TaskFlow - New Task Assignment</h2>
        <p>Hello <strong>${data.recipientName}</strong>,</p>
        <p><strong>${data.assignedByName}</strong> has assigned you to the following task:</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0;">#${data.taskId} - ${data.taskTitle}</h3>
        </div>
        <p>Please log in to TaskFlow to view details, update status, and collaborate with your team.</p>
        <div style="margin-top: 24px;">
          <a href="/tasks/${data.taskId}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Task</a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated notification from TaskFlow.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"TaskFlow" <notifications@taskflow.dev>',
        to: data.recipientEmail,
        subject,
        html,
      });

      this.logger.log(
        `Sent task-assigned email to ${data.recipientEmail} for task #${data.taskId}. MessageId: ${info.messageId || 'json-stream'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send task-assigned email to ${data.recipientEmail}`,
        error,
      );
    }
  }
}
