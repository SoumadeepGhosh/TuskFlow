/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

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

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoSender {
  name: string;
  email: string;
}

export interface BrevoSendPayload {
  sender: BrevoSender;
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
}

export interface EmailHealthStatus {
  status: 'ok' | 'error' | 'warning';
  timestamp: string;
  apiKeyLoaded: boolean;
  apiKeyMasked: string | null;
  apiKeyType: 'v3_api_key' | 'smtp_key_invalid' | 'missing' | 'unknown';
  senderConfigured: BrevoSender;
  brevoAccountReachable: boolean;
  accountInfo: {
    email?: string;
    companyName?: string;
    credits?: Array<{ type: string; credits: number; creditsType: string }>;
  } | null;
  verifiedSenders: Array<{
    id: number;
    email: string;
    name?: string;
    active: boolean;
  }>;
  senderIsVerified: boolean;
  lastApiResponse: {
    timestamp: string;
    endpoint: string;
    status: number | string;
    success: boolean;
    data: unknown;
  } | null;
  configurationStatus:
    | 'CONFIGURED_AND_VERIFIED'
    | 'INVALID_API_KEY_TYPE'
    | 'SENDER_NOT_VERIFIED'
    | 'UNAUTHORIZED'
    | 'MISSING_API_KEY'
    | 'NETWORK_ERROR';
  diagnostics: string[];
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private apiKey?: string;
  private sender: BrevoSender = {
    name: 'TaskFlow',
    email: 'notifications@taskflow.dev',
  };

  private frontendUrl: string = 'http://localhost:3001';

  private lastApiResponse: {
    timestamp: string;
    endpoint: string;
    status: number | string;
    success: boolean;
    data: unknown;
  } | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initConfiguration();
  }

  private initConfiguration() {
    // 1. Resolve Brevo API key: Support BREVO_API_KEY and fallback to legacy envs
    const rawKey =
      this.configService.get<string>('BREVO_API_KEY') ||
      this.configService.get<string>('BREVO_KEY') ||
      this.configService.get<string>('MAIL_PASSWORD');

    if (rawKey && rawKey.trim().length > 0) {
      this.apiKey = rawKey.replace(/['"]/g, '').trim();
    }

    // 2. Parse sender information from MAIL_FROM
    const rawFrom =
      this.configService.get<string>('MAIL_FROM') ||
      'TaskFlow <notifications@taskflow.dev>';
    this.sender = this.parseSender(rawFrom);

    // 3. Resolve frontend URL for email links
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('APP_URL') ||
      'http://localhost:3001';

    // 4. Log initial status
    if (this.apiKey) {
      const keyType = this.detectKeyType(this.apiKey);
      if (keyType === 'smtp_key_invalid') {
        this.logger.error(
          `❌ [EmailService] CRITICAL CONFIGURATION ISSUE DETECTED:\n` +
            `The configured BREVO_API_KEY starts with "xsmtpsib-".\n` +
            `This is a Brevo SMTP key, NOT a Brevo v3 REST API key!\n` +
            `Brevo's REST API (https://api.brevo.com/v3/smtp/email) rejects SMTP keys with HTTP 401 ("Key not found").\n` +
            `-> To fix: Log into Brevo > SMTP & API > API Keys (tab) > Generate a new API key (starts with "xkeysib-").`,
        );
      } else {
        this.logger.log(
          `[EmailService] Initialized with Brevo REST API. Key: ${this.getMaskedApiKey()}, Sender: "${this.sender.name}" <${this.sender.email}>`,
        );
      }
    } else {
      this.logger.error(
        `❌ [EmailService] BREVO_API_KEY is not defined in environment variables! Transactional emails will fail to send.`,
      );
    }
  }

  public detectKeyType(
    key?: string,
  ): 'v3_api_key' | 'smtp_key_invalid' | 'missing' | 'unknown' {
    if (!key) return 'missing';
    if (key.startsWith('xsmtpsib-')) return 'smtp_key_invalid';
    if (key.startsWith('xkeysib-')) return 'v3_api_key';
    return 'unknown';
  }

  public getMaskedApiKey(): string {
    if (!this.apiKey) return '(none)';
    if (this.apiKey.length <= 12) return '***';
    return `${this.apiKey.slice(0, 8)}...${this.apiKey.slice(-4)}`;
  }

  /**
   * Parse sender string like 'TaskFlow <support@domain.com>' or 'support@domain.com'
   */
  public parseSender(raw: string): BrevoSender {
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
   * Startup verification: Check Brevo REST API connectivity and sender verification.
   */
  async onModuleInit(): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn(
        `⚠️ [EmailService] Skipping Brevo API verification: No BREVO_API_KEY found.`,
      );
      return;
    }

    const keyType = this.detectKeyType(this.apiKey);
    if (keyType === 'smtp_key_invalid') {
      this.logger.error(
        `❌ [EmailService] Cannot verify Brevo API: The key provided starts with 'xsmtpsib-'. Please generate a v3 REST API key starting with 'xkeysib-' from Brevo Dashboard > SMTP & API > API Keys.`,
      );
      return;
    }

    try {
      this.logger.log(
        `[EmailService] Verifying Brevo REST API credentials (GET https://api.brevo.com/v3/account)...`,
      );
      const accountRes = await axios.get('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': this.apiKey,
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      this.logger.log(
        `✅ [EmailService] Brevo API connection verified! Account: ${accountRes.data?.email || 'verified'}. Plan: ${JSON.stringify(accountRes.data?.plan || [])}`,
      );

      // Verify configured sender
      try {
        const sendersRes = await axios.get('https://api.brevo.com/v3/senders', {
          headers: {
            'api-key': this.apiKey,
            Accept: 'application/json',
          },
          timeout: 10000,
        });

        const senders: Array<{ email: string; active: boolean }> =
          sendersRes.data?.senders || [];
        const isVerified = senders.some(
          (s) =>
            s.email.toLowerCase() === this.sender.email.toLowerCase() &&
            s.active,
        );

        if (isVerified) {
          this.logger.log(
            `✅ [EmailService] Sender "${this.sender.email}" is an ACTIVE VERIFIED sender in Brevo. Emails will be delivered smoothly.`,
          );
        } else {
          this.logger.warn(
            `⚠️ [EmailService] Sender "${this.sender.email}" was NOT found among verified active senders in Brevo! ` +
              `Active Brevo senders: [${senders.map((s) => s.email).join(', ')}]. ` +
              `Please add "${this.sender.email}" in Brevo under Senders & IP to prevent delivery failures.`,
          );
        }
      } catch (senderErr) {
        this.logger.warn(
          `Could not verify sender list: ${(senderErr as Error).message}`,
        );
      }
    } catch (err: unknown) {
      const isAxios = axios.isAxiosError(err);
      const status = isAxios ? err.response?.status : undefined;
      const responseData = isAxios ? err.response?.data : undefined;
      const errorMsg = isAxios ? err.message : (err as Error).message;

      this.logger.error(
        `❌ [EmailService] Startup Brevo API verification FAILED!\n` +
          `HTTP Status: ${status || 'NETWORK_ERROR'}\n` +
          `Error: ${errorMsg}\n` +
          `Response: ${JSON.stringify(responseData)}\n` +
          `Please check that BREVO_API_KEY is an active v3 API key from Brevo Dashboard > SMTP & API > API Keys.`,
      );
    }
  }

  /**
   * Health status endpoint handler for GET /email/health and GET /api/email/health
   */
  async getHealthStatus(): Promise<EmailHealthStatus> {
    const diagnostics: string[] = [];
    const keyType = this.detectKeyType(this.apiKey);
    let brevoAccountReachable = false;
    let accountInfo: EmailHealthStatus['accountInfo'] = null;
    let verifiedSenders: EmailHealthStatus['verifiedSenders'] = [];
    let senderIsVerified = false;
    let configurationStatus: EmailHealthStatus['configurationStatus'] =
      'CONFIGURED_AND_VERIFIED';

    if (!this.apiKey) {
      configurationStatus = 'MISSING_API_KEY';
      diagnostics.push(
        'BREVO_API_KEY is not configured in environment variables. Generate a v3 key (starts with "xkeysib-") in Brevo.',
      );
    } else if (keyType === 'smtp_key_invalid') {
      configurationStatus = 'INVALID_API_KEY_TYPE';
      diagnostics.push(
        'The configured BREVO_API_KEY starts with "xsmtpsib-". This is a Brevo SMTP password, NOT a REST API v3 key. Generate a v3 key (starts with "xkeysib-") under Brevo Dashboard > SMTP & API > API Keys.',
      );
    } else {
      // Live probe to Brevo API
      try {
        const accountRes = await axios.get('https://api.brevo.com/v3/account', {
          headers: {
            'api-key': this.apiKey,
            Accept: 'application/json',
          },
          timeout: 8000,
        });

        brevoAccountReachable = true;
        accountInfo = {
          email: accountRes.data?.email,
          companyName: accountRes.data?.companyName,
          credits: accountRes.data?.plan,
        };

        const sendersRes = await axios.get('https://api.brevo.com/v3/senders', {
          headers: {
            'api-key': this.apiKey,
            Accept: 'application/json',
          },
          timeout: 8000,
        });

        verifiedSenders = sendersRes.data?.senders || [];
        senderIsVerified = verifiedSenders.some(
          (s) =>
            s.email.toLowerCase() === this.sender.email.toLowerCase() &&
            s.active,
        );

        if (!senderIsVerified) {
          configurationStatus = 'SENDER_NOT_VERIFIED';
          diagnostics.push(
            `Configured sender "${this.sender.email}" is not in Brevo's verified senders list. Verified senders: [${verifiedSenders.map((s) => s.email).join(', ')}]. Add it under Brevo > Senders & IP.`,
          );
        } else {
          diagnostics.push(
            `Brevo account verified (${accountInfo.email}). Sender "${this.sender.email}" is active and authorized.`,
          );
        }
      } catch (err: unknown) {
        const isAxios = axios.isAxiosError(err);
        const status = isAxios ? err.response?.status : undefined;
        const responseData = isAxios ? err.response?.data : undefined;

        if (status === 401) {
          configurationStatus = 'UNAUTHORIZED';
          diagnostics.push(
            `Brevo rejected the API key (HTTP 401 Unauthorized: ${JSON.stringify(responseData)}). Ensure you generated a v3 API key.`,
          );
        } else {
          configurationStatus = 'NETWORK_ERROR';
          diagnostics.push(
            `Failed to communicate with Brevo API: ${isAxios ? err.message : (err as Error).message}`,
          );
        }
      }
    }

    const overallStatus: EmailHealthStatus['status'] =
      configurationStatus === 'CONFIGURED_AND_VERIFIED'
        ? 'ok'
        : configurationStatus === 'SENDER_NOT_VERIFIED'
          ? 'warning'
          : 'error';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      apiKeyLoaded: Boolean(this.apiKey),
      apiKeyMasked: this.getMaskedApiKey(),
      apiKeyType: keyType,
      senderConfigured: this.sender,
      brevoAccountReachable,
      accountInfo,
      verifiedSenders,
      senderIsVerified,
      lastApiResponse: this.lastApiResponse,
      configurationStatus,
      diagnostics,
    };
  }

  /**
   * Sends transactional email using official Brevo HTTPS REST API.
   * Endpoint: POST https://api.brevo.com/v3/smtp/email
   */
  async sendBrevoEmail(
    payload: BrevoSendPayload,
  ): Promise<{ success: boolean; messageId?: string; error?: unknown }> {
    if (!this.apiKey) {
      const errorMsg =
        'BREVO_API_KEY is not set. Transactional email was not sent.';
      this.logger.error(`[EmailService] ${errorMsg}`);
      this.lastApiResponse = {
        timestamp: new Date().toISOString(),
        endpoint: 'POST https://api.brevo.com/v3/smtp/email',
        status: 'MISSING_API_KEY',
        success: false,
        data: { message: errorMsg },
      };
      return { success: false, error: errorMsg };
    }

    const keyType = this.detectKeyType(this.apiKey);
    if (keyType === 'smtp_key_invalid') {
      const errorMsg =
        'Configured BREVO_API_KEY starts with "xsmtpsib-". Brevo REST API requires a v3 key starting with "xkeysib-".';
      this.logger.error(`[EmailService] ${errorMsg}`);
      this.lastApiResponse = {
        timestamp: new Date().toISOString(),
        endpoint: 'POST https://api.brevo.com/v3/smtp/email',
        status: 401,
        success: false,
        data: { code: 'unauthorized', message: errorMsg },
      };
      return { success: false, error: errorMsg };
    }

    // Task 11: Print exact JSON payload being sent to Brevo (excluding API key)
    this.logger.log(
      `==================================================\n` +
        `[Brevo Outbound Request]\n` +
        `Endpoint: POST https://api.brevo.com/v3/smtp/email\n` +
        `Headers: api-key: ${this.getMaskedApiKey()}, Content-Type: application/json, Accept: application/json\n` +
        `Payload:\n${JSON.stringify(payload, null, 2)}\n` +
        `==================================================`,
    );

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

        // Task 2: Log on success: HTTP status, messageId, response body
        this.logger.log(
          `==================================================\n` +
            `[Brevo API Success]\n` +
            `HTTP Status: ${response.status} ${response.statusText}\n` +
            `MessageId: ${messageId}\n` +
            `Response Body:\n${JSON.stringify(response.data, null, 2)}\n` +
            `Recipients: ${payload.to.map((t) => t.email).join(', ')}\n` +
            `==================================================`,
        );

        this.lastApiResponse = {
          timestamp: new Date().toISOString(),
          endpoint: 'POST https://api.brevo.com/v3/smtp/email',
          status: response.status,
          success: true,
          data: response.data,
        };

        return { success: true, messageId };
      } catch (err: unknown) {
        const isAxios = axios.isAxiosError(err);
        const axiosErr = err as AxiosError;
        const status = isAxios ? axiosErr.response?.status : undefined;
        const responseData = isAxios ? axiosErr.response?.data : undefined;
        const errorMsg = isAxios ? axiosErr.message : (err as Error).message;

        // Task 2 & 3: Log on failure: HTTP status, error.response.data, error.message, request payload
        this.logger.error(
          `==================================================\n` +
            `[Brevo API Failure - Attempt ${attempt}/${maxRetries}]\n` +
            `HTTP Status: ${status || 'NETWORK_TIMEOUT/ERROR'}\n` +
            `Error Message: ${errorMsg}\n` +
            `Brevo Response Data:\n${JSON.stringify(responseData, null, 2)}\n` +
            `Request Payload (API Key omitted):\n${JSON.stringify(payload, null, 2)}\n` +
            `==================================================`,
        );

        this.lastApiResponse = {
          timestamp: new Date().toISOString(),
          endpoint: 'POST https://api.brevo.com/v3/smtp/email',
          status: status || 'ERROR',
          success: false,
          data: responseData || errorMsg,
        };

        // Determine if transient error (rate limit 429 or server error 500-504, or network timeout)
        const isTransient =
          !status || status === 429 || (status >= 500 && status <= 504);

        if (isTransient && attempt < maxRetries) {
          this.logger.warn(
            `[EmailService] Transient error encountered. Retrying in ${delayMs}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2;
          continue;
        }

        // Non-transient errors (e.g. 400 Bad Request, 401 Unauthorized, 403 Forbidden)
        return { success: false, error: responseData || errorMsg };
      }
    }

    return { success: false, error: 'Max retries exhausted' };
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
          <a href="${this.frontendUrl}/tasks/${data.taskId}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Task</a>
        </div>
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated notification from TaskFlow.</p>
      </div>
    `;

    const payload: BrevoSendPayload = {
      sender: this.sender,
      to: [
        { email: data.recipientEmail.trim(), name: data.recipientName.trim() },
      ],
      subject,
      htmlContent,
    };

    await this.sendBrevoEmail(payload);
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

    const payload: BrevoSendPayload = {
      sender: this.sender,
      to: [{ email: data.recipientEmail.trim() }],
      subject,
      htmlContent,
    };

    await this.sendBrevoEmail(payload);
  }
}
