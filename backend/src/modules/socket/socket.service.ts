import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  emitToUser<T>(userId: number, event: string, payload: T): void {
    this.socketGateway.emitToUser(userId, event, payload);
  }

  emitNotification<T>(userId: number, notification: T): void {
    this.socketGateway.emitToUser(userId, 'notification', notification);
  }
}
