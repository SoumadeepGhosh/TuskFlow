import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: string, context?: string, data?: unknown): void {
    this.logger.info(
      {
        context,
        data,
      },
      message,
    );
  }

  error(
    message: string,
    error?: unknown,
    context?: string,
    data?: unknown,
  ): void {
    this.logger.error(
      {
        context,
        error,
        data,
      },
      message,
    );
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.logger.warn(
      {
        context,
        data,
      },
      message,
    );
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.logger.debug(
      {
        context,
        data,
      },
      message,
    );
  }

  trace(message: string, context?: string, data?: unknown): void {
    this.logger.trace(
      {
        context,
        data,
      },
      message,
    );
  }
}
