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

export interface WorkspaceInvitationEmailData {
  recipientEmail: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host =
      this.configService.get<string>('SMTP_HOST') ||
      this.configService.get<string>('MAIL_HOST') ||
      'localhost';
    const port =
      this.configService.get<number>('SMTP_PORT') ||
      this.configService.get<number>('MAIL_PORT') ||
      587;
    const user =
      this.configService.get<string>('SMTP_USER') ||
      this.configService.get<string>('MAIL_USER');
    const pass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('MAIL_PASSWORD');

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
      const from =
        this.configService.get<string>('MAIL_FROM') ||
        '"TaskFlow" <notifications@taskflow.dev>';
      const info = await this.transporter.sendMail({
        from,
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

  async sendWorkspaceInvitationEmail(
    data: WorkspaceInvitationEmailData,
  ): Promise<void> {
    const formattedExpiresAt = data.expiresAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const subject = `You've been invited to join ${data.workspaceName} on TaskFlow`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #4f46e5; margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">TaskFlow</h2>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Modern Kanban & Team Collaboration</p>
        </div>
        
        <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px;">Join ${data.workspaceName}</h3>
        <p style="margin: 0 0 16px 0; font-size: 15px;">
          <strong>${data.inviterName}</strong> has invited you to join the <strong>${data.workspaceName}</strong> workspace as a <strong>${data.role}</strong>.
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569;">
          Collaborate with your team, manage sprint tasks, and track projects in real-time.
        </p>

        <div style="margin: 28px 0;">
          <a href="${data.inviteUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
            Accept Invitation
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; margin: 24px 0 0 0;">
          This invitation link will expire on <strong>${formattedExpiresAt}</strong>.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin: 8px 0 0 0; word-break: break-all;">
          Or copy and paste this link into your browser: <a href="${data.inviteUrl}" style="color: #4f46e5;">${data.inviteUrl}</a>
        </p>

        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email was sent to ${data.recipientEmail}. If you were not expecting this invitation, you can safely ignore this email.</p>
      </div>
    `;

    try {
      const from =
        this.configService.get<string>('MAIL_FROM') ||
        '"TaskFlow" <notifications@taskflow.dev>';
      const info = await this.transporter.sendMail({
        from,
        to: data.recipientEmail,
        subject,
        html,
      });

      this.logger.log(
        `Sent workspace invitation email to ${data.recipientEmail} for workspace ${data.workspaceName}. MessageId: ${info.messageId || 'json-stream'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send workspace invitation email to ${data.recipientEmail}`,
        error,
      );
    }
  }
}
