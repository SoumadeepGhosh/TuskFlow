import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-error-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Full detailed logging for every exception
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: unknown }).message
          : exception.message;

      if (status >= 500) {
        this.logger.error(
          `[${request.method}] ${request.url} - Status ${status} - Error: ${exception.message}`,
          exception.stack,
        );
      } else {
        this.logger.warn(
          `[${request.method}] ${request.url} - Status ${status} - Message: ${JSON.stringify(message)}`,
        );
      }
    } else if (exception instanceof Error) {
      // Unhandled Exceptions (Prisma errors, TypeErrors, etc.)
      const prismaCode = (exception as { code?: string }).code;
      const prismaMeta = (exception as { meta?: unknown }).meta;

      console.error('\n==================== 500 UNHANDLED EXCEPTION ====================');
      console.error(`Endpoint: [${request.method}] ${request.url}`);
      console.error(`Type: ${exception.constructor.name || exception.name}`);
      console.error(`Message: ${exception.message}`);
      if (prismaCode) {
        console.error(`Prisma Code: ${prismaCode}`);
      }
      if (prismaMeta) {
        console.error(`Prisma Meta: ${JSON.stringify(prismaMeta, null, 2)}`);
      }
      console.error(`Stack: \n${exception.stack}`);
      console.error('=================================================================\n');

      this.logger.error(
        `[${request.method}] ${request.url} - ${exception.name}: ${exception.message}`,
        exception.stack,
      );
    } else {
      console.error(
        `[${request.method}] ${request.url} - Unknown Exception:`,
        exception,
      );
      this.logger.error(
        `[${request.method}] ${request.url} - Unknown Exception: ${JSON.stringify(exception)}`,
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message:
        exception instanceof HttpException
          ? exception.message
          : process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : exception instanceof Error
              ? exception.message
              : 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
