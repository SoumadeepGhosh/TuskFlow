import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
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
export class EmailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;
  private currentPort = 587;
  private isConfigured = false;

  private host = 'localhost';
  private user?: string;
  private pass?: string;
  private defaultFrom = 'TaskFlow <notifications@taskflow.dev>';

  constructor(private readonly configService: ConfigService) {
    this.initConfiguration();
  }

  private initConfiguration() {
    this.host =
      this.configService.get<string>('SMTP_HOST') ||
      this.configService.get<string>('MAIL_HOST') ||
      'localhost';

    const configuredPort = Number(
      this.configService.get<number>('SMTP_PORT') ||
        this.configService.get<number>('MAIL_PORT') ||
        587,
    );

    this.user =
      this.configService.get<string>('SMTP_USER') ||
      this.configService.get<string>('MAIL_USER');

    this.pass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('MAIL_PASSWORD');

    this.defaultFrom =
      this.configService.get<string>('MAIL_FROM') ||
      'TaskFlow <notifications@taskflow.dev>';

    this.currentPort = configuredPort;

    if (this.user && this.pass) {
      this.isConfigured = true;
      this.transporter = this.createTransporterForPort(this.currentPort);
    } else {
      this.isConfigured = false;
      this.logger.warn(
        'EmailService initialized in jsonTransport mode (no SMTP credentials found in environment).',
      );
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  /**
   * Builds a production-grade Nodemailer transporter with connection pooling,
   * enforced IPv4 family (preventing Railway IPv6 hang), and robust timeouts.
   */
  private createTransporterForPort(port: number): nodemailer.Transporter {
    const isSecure = port === 465;

    return nodemailer.createTransport({
      host: this.host,
      port,
      secure: isSecure, // true for 465, false for 587 / 2525
      auth: {
        user: this.user,
        pass: this.pass,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      family: 4, // ENFORCE IPv4: Prevents Railway Linux containers from hanging on IPv6 route dead-ends
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 10000, // 10s greeting timeout
      socketTimeout: 15000, // 15s socket activity timeout
      tls: {
        rejectUnauthorized: false,
        servername: this.host,
      },
    } as nodemailer.TransportOptions);
  }

  /**
   * Verify SMTP connection on application startup and auto-fallback if blocked.
   */
  async onModuleInit(): Promise<void> {
    if (!this.isConfigured) return;

    this.logger.log(
      `Verifying SMTP connection to ${this.host}:${this.currentPort} (IPv4 enforced)...`,
    );

    try {
      await this.transporter.verify();
      this.logger.log(
        `✅ SMTP Connection verified successfully on ${this.host}:${this.currentPort} (secure=${this.currentPort === 465}). Ready to send emails.`,
      );
    } catch (err: unknown) {
      const error = err as Error & { code?: string; command?: string };
      this.logger.warn(
        `⚠️ Initial SMTP verification failed on port ${this.currentPort} (${error.code || error.message}). Attempting automatic port failover...`,
      );

      // Railway / cloud egress often blocks port 587. Attempt automatic fallback to 465 (SSL) or 2525.
      const fallbackPorts = [465, 2525, 587].filter(
        (p) => p !== this.currentPort,
      );
      let recovered = false;

      for (const fallbackPort of fallbackPorts) {
        try {
          this.logger.log(
            `Testing fallback SMTP connection on port ${fallbackPort}...`,
          );
          const candidateTransporter =
            this.createTransporterForPort(fallbackPort);
          await candidateTransporter.verify();

          this.transporter = candidateTransporter;
          this.currentPort = fallbackPort;
          this.logger.log(
            `✅ Successfully recovered! Active SMTP port switched to ${fallbackPort} (secure=${fallbackPort === 465}).`,
          );
          recovered = true;
          break;
        } catch {
          // Continue to next fallback candidate
        }
      }

      if (!recovered) {
        this.logger.error(
          `❌ All SMTP port connection attempts (587, 465, 2525) failed to reach ${this.host}.
Please ensure Railway outbound traffic is enabled or your SMTP provider allows connections from your Railway IP.`,
        );
      }
    }
  }

  /**
   * Resilient mail dispatcher with automatic retry and port failover.
   */
  private async sendMailWithRetry(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<nodemailer.SentMessageInfo | null> {
    if (!this.isConfigured) {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.debug(
        `[Mock Email] ${JSON.stringify(mailOptions.to)} - Subject: ${mailOptions.subject}`,
      );
      return info;
    }

    // Try current active transporter first
    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (err: unknown) {
      const primaryError = err as Error & { code?: string; command?: string };
      this.logSmtpError(
        'Primary attempt failed',
        primaryError,
        this.currentPort,
      );

      // If connection timed out or was refused (common Railway egress block on 587), try alternative ports
      const isConnectionError =
        primaryError.code === 'ETIMEDOUT' ||
        primaryError.code === 'ECONNREFUSED' ||
        primaryError.code === 'ESOCKET' ||
        primaryError.command === 'CONN';

      if (isConnectionError) {
        const alternativePorts = [465, 2525, 587].filter(
          (p) => p !== this.currentPort,
        );

        for (const port of alternativePorts) {
          try {
            this.logger.warn(
              `Retrying email delivery to ${String(mailOptions.to)} via alternative port ${port}...`,
            );
            const fallbackTransporter = this.createTransporterForPort(port);
            const info = await fallbackTransporter.sendMail(mailOptions);

            // If successful, switch active transporter to this functioning port
            this.transporter = fallbackTransporter;
            this.currentPort = port;
            this.logger.log(
              `✅ Email successfully delivered via fallback port ${port}! Switched active port to ${port}.`,
            );
            return info;
          } catch (fallbackErr: unknown) {
            this.logSmtpError(
              `Fallback attempt on port ${port} failed`,
              fallbackErr as Error & { code?: string; command?: string },
              port,
            );
          }
        }
      }

      return null;
    }
  }

  private logSmtpError(
    context: string,
    err: Error & { code?: string; command?: string },
    port: number,
  ) {
    const maskedUser = this.user
      ? this.user.length > 5
        ? `${this.user.slice(0, 3)}***${this.user.slice(this.user.indexOf('@'))}`
        : 'configured'
      : 'none';

    this.logger.error(
      `[SMTP ERROR] ${context}
  Host: ${this.host}
  Port: ${port} (secure: ${port === 465})
  User: ${maskedUser}
  Error Code: ${err.code || 'UNKNOWN'}
  Command: ${err.command || 'UNKNOWN'}
  Message: ${err.message}`,
      err.stack,
    );
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
      const info = await this.sendMailWithRetry({
        from: this.defaultFrom,
        to: data.recipientEmail,
        subject,
        html,
      });

      if (info) {
        this.logger.log(
          `Sent task-assigned email to ${data.recipientEmail} for task #${data.taskId}. MessageId: ${info.messageId || 'sent'}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send task-assigned email to ${data.recipientEmail}: ${(error as Error).message}`,
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
      const info = await this.sendMailWithRetry({
        from: this.defaultFrom,
        to: data.recipientEmail,
        subject,
        html,
      });

      if (info) {
        this.logger.log(
          `Sent workspace invitation email to ${data.recipientEmail} for workspace "${data.workspaceName}". MessageId: ${info.messageId || 'sent'}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send workspace invitation email to ${data.recipientEmail}: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.transporter && 'close' in this.transporter) {
      (this.transporter as { close: () => void }).close();
      this.logger.log('EmailService transporter closed');
    }
  }
}
