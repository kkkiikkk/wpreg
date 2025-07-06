import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { WebSocketResponse, UserConnectionInfo } from './websocket.types';

@Injectable()
@NestWebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, UserConnectionInfo> = new Map();

  async handleConnection(client: Socket): Promise<void> {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });

    const token = client.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const user = await this.authService.verifyToken(token);
        if (user) {
          this.connectedClients.set(client.id, {
            socket: client,
            userId: user.id,
          });
          client.join(`user-${user.id}`);
          console.log(`User authenticated: ${user.id}`);
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Authentication error:', err.message);
      }
    }
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: unknown): WebSocketResponse {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo?.userId) {
      console.log(`Message from user ${clientInfo.userId}:`, payload);
      return { event: 'message', data: payload };
    }
    return { event: 'error', message: 'Unauthorized' };
  }

  broadcastToAuthenticatedUsers(event: string, data: unknown): void {
    for (const [, clientInfo] of this.connectedClients.entries()) {
      // Проверяем, что пользователь аутентифицирован (есть userId)
      if (clientInfo.userId && clientInfo.socket && clientInfo.socket.emit) {
        clientInfo.socket.emit(event, data);
      }
    }
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user-${userId}`).emit(event, data);
  }
}
