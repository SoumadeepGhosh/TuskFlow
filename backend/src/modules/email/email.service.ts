import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

interface BrevoRecipient {
  email: string;
  name?: string;
}

interface BrevoSender {
  name: string;
  email: string;
}

interface BrevoSendPayload {
  sender: BrevoSender;
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private apiKey?: string;
  private sender: BrevoSender = {
    name: 'TaskFlow',
    email: 'notifications@taskflow.dev',
  };

  constructor(private readonly configService: ConfigService) {
    this.initConfiguration();
  }

  private initConfiguration() {
    // 1. Resolve Brevo API key: Support BREVO_API_KEY and fallback to MAIL_PASSWORD if it's a Brevo API key
    const directKey = this.configService.get<string>('BREVO_API_KEY');
    const mailPassword = this.configService.get<string>('MAIL_PASSWORD');

    if (directKey && directKey.trim().length > 0) {
      this.apiKey = directKey.trim();
    } else if (mailPassword && mailPassword.startsWith('xkeysib-')) {
      this.apiKey = mailPassword.trim();
    }

    // 2. Parse sender information from MAIL_FROM
    const rawFrom =
      this.configService.get<string>('MAIL_FROM') ||
      'TaskFlow <notifications@taskflow.dev>';
    this.sender = this.parseSender(rawFrom);

    if (this.apiKey) {
      const maskedKey = `${this.apiKey.slice(0, 10)}...${this.apiKey.slice(-4)}`;
      this.logger.log(
        `EmailService initialized with Brevo REST API (HTTPS). Key: ${maskedKey}, Sender: "${this.sender.name}" <${this.sender.email}>`,
      );
    } else {
      this.logger.warn(
        'EmailService initialized in mock/log mode. No BREVO_API_KEY found in environment variables.',
      );
    }
  }

  /**
   * Parse sender string like 'TaskFlow <support@domain.com>' or 'support@domain.com'
   */
  private parseSender(raw: string): BrevoSender {
    const match = raw.match(
      /^(?:["']?([^"']*)["']?\s+)?<?([^\s<>]+@[^\s<>]+)>?$/,
    );
    if (match) {
      const name = match[1]?.trim() || 'TaskFlow';
      const email = match[2]?.trim() || 'notifications@taskflow.dev';
      return { name, email };
    }
    return {
      name: 'TaskFlow',
      email: raw.includes('@') ? raw.trim() : 'notifications@taskflow.dev',
    };
  }

  /**
   * Verify Brevo API connection and credentials on startup via Brevo HTTPS API.
   */
  async onModuleInit(): Promise<void> {
    if (!this.apiKey) {
      return;
    }

    try {
      this.logger.log('Verifying Brevo REST API credentials via HTTPS...');
      const response = await axios.get('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      const accountEmail = response.data?.email || 'verified';
      this.logger.log(
        `✅ Brevo REST API connection verified successfully via HTTPS. Account: ${accountEmail}. Ready to send emails.`,
      );
    } catch (err: unknown) {
      const isAxios = axios.isAxiosError(err);
      const status = isAxios ? err.response?.status : undefined;
      const details = isAxios
        ? JSON.stringify(err.response?.data || err.message)
        : (err as Error).message;

      this.logger.warn(
        `⚠️ Brevo API verification check returned HTTP ${status || 'ERR'}: ${details}.
Emails will still be attempted over HTTPS when requested.`,
      );
    }
  }

  /**
   * Sends transactional email using official Brevo HTTPS REST API with exponential backoff retry.
   * Never throws uncaught exceptions so API callers are never failed by email operations.
   */
  private async sendBrevoEmail(payload: BrevoSendPayload): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.debug(
        `[Mock Email] To: ${payload.to.map((t) => t.email).join(', ')} | Subject: "${payload.subject}"`,
      );
      return true;
    }

    const maxRetries = 3;
    let delayMs = 500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          payload,
          {
            headers: {
              'api-key': this.apiKey,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 10000,
          },
        );

        const messageId = response.data?.messageId || 'sent';
        this.logger.log(
          `✅ Brevo email delivered to ${payload.to.map((t) => t.email).join(', ')}. MessageId: ${messageId}`,
        );
        return true;
      } catch (err: unknown) {
        const isAxios = axios.isAxiosError(err);
        const status = isAxios ? err.response?.status : undefined;
        const responseData = isAxios
          ? JSON.stringify(err.response?.data)
          : undefined;
        const errorMsg = isAxios
          ? `${err.message}${responseData ? ` (Details: ${responseData})` : ''}`
          : (err as Error).message;

        // Determine if error is transient and retryable (timeouts, rate limits 429, server 5xx)
        const isTransient =
          !status ||
          status === 429 ||
          (status >= 500 && status <= 504);

        if (isTransient && attempt < maxRetries) {
          this.logger.warn(
            `Brevo API attempt ${attempt}/${maxRetries} failed (${errorMsg}). Retrying in ${delayMs}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2;
          continue;
        }

        this.logger.error(
          `❌ Failed to deliver email to ${payload.to.map((t) => t.email).join(', ')} via Brevo HTTPS: ${errorMsg}`,
        );
        return false;
      }
    }

    return false;
  }

  async sendTaskAssignedEmail(data: TaskAssignedEmailData): Promise<void> {
    const subject = `You have been assigned to task: "${data.taskTitle}"`;
    const htmlContent = `
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
      await this.sendBrevoEmail({
        sender: this.sender,
        to: [{ email: data.recipientEmail, name: data.recipientName }],
        subject,
        htmlContent,
      });
    } catch (error) {
      this.logger.error(
        `Unexpected error in sendTaskAssignedEmail to ${data.recipientEmail}: ${(error as Error).message}`,
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
    const htmlContent = `
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
      await this.sendBrevoEmail({
        sender: this.sender,
        to: [{ email: data.recipientEmail }],
        subject,
        htmlContent,
      });
    } catch (error) {
      this.logger.error(
        `Unexpected error in sendWorkspaceInvitationEmail to ${data.recipientEmail}: ${(error as Error).message}`,
      );
    }
  }
}
