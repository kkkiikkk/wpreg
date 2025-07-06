import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGateway } from './websocket.gateway';
import { AuthService } from '../auth/auth.service';
import { Socket, Server } from 'socket.io';
import { User } from '../user/user.types';
import { Web3AuthGuard } from '../auth/web3auth.guard';

// Temporarily skipping WebSocket tests
describe.skip('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let authService: AuthService;

  const mockUser: User = {
    id: 'user-id-1',
    address: '0x1234567890abcdef',
    username: 'testuser',
    loginMethod: 'metamask',
    email: null,
    isEmailVerified: false,
    emailVerifyToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-id',
    join: jest.fn(),
    emit: jest.fn(),
    handshake: {
      auth: {
        token: 'valid-token',
      },
    },
  };

  const mockAuthService = {
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGateway,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Web3AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    authService = module.get<AuthService>(AuthService);

    gateway.server = mockServer as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should add client to connected clients map', () => {
      gateway.handleConnection(mockSocket as unknown as Socket);

      expect(gateway['connectedClients'].has('socket-id')).toBe(true);
      const client = gateway['connectedClients'].get('socket-id');
      expect(client).toBeDefined();
      expect(client?.socket).toBe(mockSocket);
    });

    it('should authenticate client with token and join user room', async () => {
      mockAuthService.verifyToken.mockResolvedValueOnce(mockUser);

      await gateway.handleConnection(mockSocket as unknown as Socket);

      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.join).toHaveBeenCalledWith(`user-${mockUser.id}`);
      const client = gateway['connectedClients'].get('socket-id');
      expect(client).toBeDefined();
      expect(client?.userId).toBe(mockUser.id);
    });

    it('should handle authentication error gracefully', async () => {
      mockAuthService.verifyToken.mockRejectedValueOnce(
        new Error('Invalid token'),
      );

      await gateway.handleConnection(mockSocket as unknown as Socket);

      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockSocket.join).not.toHaveBeenCalled();
      const client = gateway['connectedClients'].get('socket-id');
      expect(client).toBeDefined();
      expect(client?.userId).toBeUndefined();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from connected clients map', () => {
      gateway['connectedClients'].set('socket-id', {
        socket: mockSocket as unknown as Socket,
      });

      gateway.handleDisconnect(mockSocket as unknown as Socket);

      expect(gateway['connectedClients'].has('socket-id')).toBe(false);
    });
  });

  describe('handleMessage', () => {
    it('should return error response when user is not authenticated', () => {
      gateway['connectedClients'].set('socket-id', {
        socket: mockSocket as unknown as Socket,
      });

      const payload = { content: 'test message' };
      const result = gateway.handleMessage(
        mockSocket as unknown as Socket,
        payload,
      );

      expect(result).toEqual({ event: 'error', message: 'Unauthorized' });
    });

    it('should handle and return message when user is authenticated', () => {
      gateway['connectedClients'].set('socket-id', {
        socket: mockSocket as unknown as Socket,
        userId: mockUser.id,
      });

      const payload = { content: 'test message' };
      const result = gateway.handleMessage(
        mockSocket as unknown as Socket,
        payload,
      );

      expect(result).toEqual({ event: 'message', data: payload });
    });
  });

  describe('broadcastToAuthenticatedUsers', () => {
    it('should emit message to all authenticated users', () => {
      const mockSocket2 = { ...mockSocket, id: 'socket-id-2' };
      const mockSocket3 = { ...mockSocket, id: 'socket-id-3' };

      gateway['connectedClients'].set('socket-id', {
        socket: mockSocket as unknown as Socket,
        userId: mockUser.id,
      });

      gateway['connectedClients'].set('socket-id-2', {
        socket: mockSocket2 as unknown as Socket,
        userId: 'user-id-2',
      });

      gateway['connectedClients'].set('socket-id-3', {
        socket: mockSocket3 as unknown as Socket,
      });

      const event = 'testEvent';
      const data = { test: 'data' };

      mockSocket.emit.mockClear();
      mockSocket2.emit.mockClear();
      mockSocket3.emit.mockClear();

      gateway.broadcastToAuthenticatedUsers(event, data);

      expect(mockSocket.emit).toHaveBeenCalledWith(event, data);
      expect(mockSocket2.emit).toHaveBeenCalledWith(event, data);
      expect(mockSocket3.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendToUser', () => {
    it('should emit message to the specific user room', () => {
      const event = 'testEvent';
      const data = { test: 'data' };
      const userId = 'user-id-1';

      gateway.sendToUser(userId, event, data);

      expect(mockServer.to).toHaveBeenCalledWith(`user-${userId}`);
      expect(mockServer.emit).toHaveBeenCalledWith(event, data);
    });
  });
});
