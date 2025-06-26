import { Socket } from 'socket.io';

export interface WebSocketMessage {
  type: string;
  timestamp: number;
}

export interface WebSocketResponse {
  event: string;
  data?: unknown;
  message?: string;
}

export interface UserConnectionInfo {
  socket: Socket;
  userId?: string;
}
