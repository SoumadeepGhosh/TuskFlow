import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test')
  async sendTestEmail(@Query('to') to: string) {
    if (!to) {
      return {
        success: false,
        message:
          'Please provide an email. Example: /email/test?to=you@gmail.com',
      };
    }

    await this.emailService.sendTestEmail(to);

    return {
      success: true,
      message: `Test email sent to ${to}`,
    };
  }
}
