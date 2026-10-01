import {
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from '../../common/token/token.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(private readonly tokenService: TokenService) {}

  onModuleInit() {
    this.logger.log('SocketGateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization
          ? client.handshake.headers.authorization.replace('Bearer ', '')
          : null);

      if (!rawToken) {
        this.logger.warn(`Socket connection rejected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      const payload = this.tokenService.verifyToken(rawToken) as JwtPayload;

      if (!payload || !payload.sub) {
        this.logger.warn(`Socket connection rejected: Invalid payload (${client.id})`);
        client.disconnect();
        return;
      }

      const userRoom = `user:${payload.sub}`;
      void client.join(userRoom);
      this.logger.log(`Client ${client.id} joined room ${userRoom}`);
    } catch (error) {
      this.logger.warn(`Socket authentication failed for client ${client.id}: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitToUser<T>(userId: number, event: string, payload: T) {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit(event, payload);
    this.logger.log(`Emitted event "${event}" to room "${userRoom}"`);
  }
}
