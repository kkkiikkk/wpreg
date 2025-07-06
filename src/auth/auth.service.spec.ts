import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser: User = {
    id: 'user-id-1',
    address: '0x1234567890abcdef',
    username: 'testuser',
    loginMethod: 'metamask',
    email: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    findByAddress: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'jwt.accessTokenExpiresIn') return 3600;
      if (key === 'jwt.refreshTokenExpiresIn') return 604800;
      if (key === 'jwt.secret') return 'test-secret';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token response with access and refresh tokens', () => {
      const userId = 'user-id-1';
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockJwtService.sign.mockImplementation((payload, options) => {
        if (payload.refresh) return refreshToken;
        return accessToken;
      });

      const result = service.login(userId);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userId },
        {
          expiresIn: 3600,
        },
      );

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userId, refresh: true },
        {
          expiresIn: 604800,
        },
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const validPayload = { sub: mockUser.id, refresh: true };
      const loginResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      };

      mockJwtService.verifyAsync.mockResolvedValueOnce(validPayload);
      mockUserService.findById.mockResolvedValueOnce(mockUser);

      jest.spyOn(service, 'login').mockReturnValueOnce(loginResult);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual(loginResult);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(service.login).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(
        new Error('Invalid token'),
      );

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
    });

    it('should throw UnauthorizedException when payload does not have refresh flag', async () => {
      const invalidPayload = { sub: mockUser.id };
      mockJwtService.verifyAsync.mockResolvedValueOnce(invalidPayload);

      await expect(
        service.refreshToken('token-without-refresh-flag'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const validPayload = { sub: mockUser.id, refresh: true };
      mockJwtService.verifyAsync.mockResolvedValueOnce(validPayload);
      mockUserService.findById.mockResolvedValueOnce(null);

      await expect(
        service.refreshToken('token-with-invalid-user'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('authenticate', () => {
    // Test cases for wallet-based authentication
    describe('with wallet address', () => {
      it('should return existing user if wallet address exists', async () => {
        mockUserService.findByAddress.mockResolvedValueOnce(mockUser);

        const result = await service.authenticate({
          address: mockUser.address || '',
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.findByAddress).toHaveBeenCalledWith(
          mockUser.address,
        );
        expect(mockUserService.createUser).not.toHaveBeenCalled();
      });

      it('should create and return a new user if wallet address is not found', async () => {
        mockUserService.findByAddress.mockResolvedValueOnce(null);
        mockUserService.createUser.mockResolvedValueOnce(mockUser);

        const result = await service.authenticate({
          address: mockUser.address || '',
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.findByAddress).toHaveBeenCalledWith(
          mockUser.address,
        );
        expect(mockUserService.createUser).toHaveBeenCalledWith({
          address: mockUser.address,
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });
      });

      it('should throw UnauthorizedException if address is not provided', async () => {
        await expect(
          service.authenticate({
            loginMethod: 'metamask',
            username: mockUser.username || undefined,
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('with wallet address', () => {
      it('should return existing user if wallet address exists', async () => {
        mockUserService.findByAddress.mockResolvedValueOnce(mockUser);

        const result = await service.authenticate({
          address: mockUser.address || '',
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.findByAddress).toHaveBeenCalledWith(
          mockUser.address,
        );
        expect(mockUserService.createUser).not.toHaveBeenCalled();
      });

      it('should create and return a new user if wallet address is not found', async () => {
        mockUserService.findByAddress.mockResolvedValueOnce(null);
        mockUserService.createUser.mockResolvedValueOnce(mockUser);

        const result = await service.authenticate({
          address: mockUser.address || '',
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.findByAddress).toHaveBeenCalledWith(
          mockUser.address,
        );
        expect(mockUserService.createUser).toHaveBeenCalledWith({
          address: mockUser.address,
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });
      });

      it('should throw UnauthorizedException if address is not provided', async () => {
        await expect(
          service.authenticate({
            loginMethod: 'metamask',
            username: mockUser.username || undefined,
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('with email', () => {
      const emailUser = {
        ...mockUser,
        email: 'test@example.com',
        address: undefined,
        isEmailVerified: false,
        emailVerifyToken: '123456',
      };

      it('should return existing user if email exists', async () => {
        mockUserService.findByEmail.mockResolvedValueOnce(emailUser);

        const result = await service.authenticate({
          email: 'test@example.com',
          loginMethod: 'email',
          username: emailUser.username || undefined,
        });

        expect(result).toEqual(emailUser);
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(
          'test@example.com',
        );
        expect(mockUserService.createUser).not.toHaveBeenCalled();
      });

      it('should create a new user if email is not found and send verification email', async () => {
        mockUserService.findByEmail.mockResolvedValueOnce(null);
        mockUserService.createUser.mockResolvedValueOnce(emailUser);
        jest.spyOn(service, 'sendVerificationEmail').mockResolvedValueOnce();

        const result = await service.authenticate({
          email: 'test@example.com',
          loginMethod: 'email',
          username: emailUser.username || undefined,
        });

        expect(result).toEqual(emailUser);
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(
          'test@example.com',
        );
        expect(mockUserService.createUser).toHaveBeenCalled();
        // Verify token is generated and email is sent
        expect(service.sendVerificationEmail).toHaveBeenCalled();
      });
    });
  });

  describe('authenticate', () => {
    // Test cases for wallet-based authentication
    describe('with wallet address', () => {
      it('should return existing user if wallet address exists', async () => {
        mockUserService.findByAddress.mockResolvedValueOnce(mockUser);

        const result = await service.authenticate({
          address: mockUser.address || '',
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.findByAddress).toHaveBeenCalledWith(
          mockUser.address,
        );
        expect(mockUserService.createUser).not.toHaveBeenCalled();
      });

      it('should create and return a new user if wallet address is not found', async () => {
        mockUserService.findByAddress.mockResolvedValueOnce(null);
        mockUserService.createUser.mockResolvedValueOnce(mockUser);

        const result = await service.authenticate({
          address: mockUser.address || '',
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });

        expect(result).toEqual(mockUser);
        expect(mockUserService.findByAddress).toHaveBeenCalledWith(
          mockUser.address,
        );
        expect(mockUserService.createUser).toHaveBeenCalledWith({
          address: mockUser.address,
          loginMethod: 'metamask',
          username: mockUser.username || undefined,
        });
      });

      it('should throw UnauthorizedException if address is not provided', async () => {
        await expect(
          service.authenticate({
            loginMethod: 'metamask',
            username: mockUser.username || undefined,
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('with email', () => {
      const emailUser = {
        ...mockUser,
        email: 'test@example.com',
        address: undefined,
        isEmailVerified: false,
        emailVerifyToken: '123456',
      };

      it('should return existing user if email exists', async () => {
        mockUserService.findByEmail.mockResolvedValueOnce(emailUser);

        const result = await service.authenticate({
          email: 'test@example.com',
          loginMethod: 'email',
          username: emailUser.username || undefined,
        });

        expect(result).toEqual(emailUser);
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(
          'test@example.com',
        );
        expect(mockUserService.createUser).not.toHaveBeenCalled();
      });

      it('should create a new user if email is not found and send verification email', async () => {
        mockUserService.findByEmail.mockResolvedValueOnce(null);
        mockUserService.createUser.mockResolvedValueOnce(emailUser);
        jest.spyOn(service, 'sendVerificationEmail').mockResolvedValueOnce();

        const result = await service.authenticate({
          email: 'test@example.com',
          loginMethod: 'email',
          username: emailUser.username || undefined,
        });

        expect(result).toEqual(emailUser);
        expect(mockUserService.findByEmail).toHaveBeenCalledWith(
          'test@example.com',
        );
        expect(mockUserService.createUser).toHaveBeenCalled();
        // Verify token is generated and email is sent
        expect(service.sendVerificationEmail).toHaveBeenCalled();
      });
    });
  });

  describe('verifyToken', () => {
    it('should return user if token is valid', async () => {
      const validPayload = { sub: mockUser.id };

      mockJwtService.verifyAsync.mockResolvedValueOnce(validPayload);
      mockUserService.findById.mockResolvedValueOnce(mockUser);

      const result = await service.verifyToken('valid-token');

      expect(result).toEqual(mockUser);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(
        new Error('Invalid token'),
      );

      const result = await service.verifyToken('invalid-token');

      expect(result).toBeNull();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
    });

    it('should return null when user not found', async () => {
      const validPayload = { sub: 'non-existent-id' };
      mockJwtService.verifyAsync.mockResolvedValueOnce(validPayload);
      mockUserService.findById.mockResolvedValueOnce(null);

      const result = await service.verifyToken('token-with-invalid-user');

      expect(result).toBeNull();
      expect(userService.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('verifyEmail', () => {
    const verificationToken = 'verify-token-123';

    const userWithToken: User = {
      ...mockUser,
      emailVerifyToken: verificationToken,
      isEmailVerified: false,
    };

    const verifiedUser: User = {
      ...userWithToken,
      emailVerifyToken: null,
      isEmailVerified: true,
    };

    it('should verify email when token is valid', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue(userWithToken);
      mockUserService.updateUser.mockResolvedValue(verifiedUser);

      const result = await service.verifyEmail(verificationToken);

      expect(mockUserService.findByEmailVerifyToken).toHaveBeenCalledWith(
        verificationToken,
      );
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        userWithToken.id,
        {
          emailVerifyToken: undefined, // Match what the service sends - either null or undefined
          isEmailVerified: true,
        },
      );
      expect(result).toEqual(verifiedUser);
    });

    it('should throw NotFoundException when token is not found', async () => {
      mockUserService.findByEmailVerifyToken.mockResolvedValue(null);
      mockUserService.updateUser.mockReset(); // Reset the mock to ensure it's not called

      await expect(service.verifyEmail(verificationToken)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserService.findByEmailVerifyToken).toHaveBeenCalledWith(
        verificationToken,
      );
      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });
  });
});
