/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: '*', // Replace with frontend URL later
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly configService: ConfigService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        console.log('❌ Socket connected without token');
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        this.configService.get<string>('jwt.secret')!,
      );

      const user = payload as unknown as JwtPayload;

      client.data.user = user;

      client.join(`user:${user.sub}`);

      console.log('==============================');
      console.log('✅ SOCKET CONNECTED');
      console.log('User ID:', user.sub);
      console.log('Room:', `user:${user.sub}`);
      console.log('Socket:', client.id);
      console.log('==============================');
    } catch (error) {
      console.log(error, '❌ Invalid Socket Token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  /**
   * Temporary
   * Remove after frontend starts sending JWT.
   */
  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    client.join(`user:${userId}`);

    console.log(`User ${userId} joined room user:${userId}`);

    client.emit('joined', {
      room: `user:${userId}`,
    });
  }

  /**
   * Send notification to one user
   */
  sendNotification(userId: number, payload: unknown) {
    console.log('==============================');
    console.log('📢 SOCKET EVENT EMITTED');
    console.log('Recipient:', userId);
    console.log('Payload:', payload);
    console.log('==============================');

    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  /**
   * Broadcast event to everyone
   */
  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
}
