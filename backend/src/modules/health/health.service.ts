import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { PasswordService } from '../../common/password/password.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const hash = await this.passwordService.hash('password123');
      return {
        status: 'ok',
        service: 'TaskFlow API',
        database: 'connected',
        hash,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(error);

      return {
        status: 'error',
        service: 'TaskFlow API',
        database: 'disconnected',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString(),
      };
    }
  }
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
