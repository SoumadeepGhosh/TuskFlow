import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller(['email', 'api/email'])
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Check Brevo Email API connection, credentials, sender, and credits',
  })
  @ApiResponse({
    status: 200,
    description: 'Brevo Email API health status and diagnostics',
  })
  async getHealth() {
    return this.emailService.getHealthStatus();
  }
}

