/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

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
}
