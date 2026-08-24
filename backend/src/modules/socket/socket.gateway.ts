import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Later replace with your frontend URL
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  /**
   * Client joins its personal room.
   * Frontend emits:
   * socket.emit('join', userId)
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
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  /**
   * Broadcast event to everyone
   */
  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
}
