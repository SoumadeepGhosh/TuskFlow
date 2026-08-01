import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-success-response.interface';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data): ApiSuccessResponse<typeof data> => ({
        success: true,
        message: 'Success',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
