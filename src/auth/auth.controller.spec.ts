import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/user.types';
import { TokenResponse } from './auth.service';
import {
  Web3AuthLoginDto,
  RefreshTokenDto,
  EmailAuthDto,
  ConnectWalletDto,
} from './dto/auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser: User = {
    id: 'user-id-1',
    address: '0xabcdef1234567890',
    username: 'testuser',
    loginMethod: 'metamask',
    email: null,
    isEmailVerified: false,
    emailVerifyToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenResponse: TokenResponse = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
  };

  const mockAuthService = {
    authenticate: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    connectWallet: jest.fn(),
    verifyEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signin', () => {
    it('should signin successfully with address', async () => {
      const signinDto: Web3AuthLoginDto = {
        address: '0x123',
        loginMethod: 'metamask',
        username: 'user',
      };

      mockAuthService.authenticate.mockResolvedValueOnce(mockUser);
      mockAuthService.login.mockReturnValueOnce(mockTokenResponse);

      const result = await controller.signin(signinDto);

      expect(result).toEqual(mockTokenResponse);
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(signinDto);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser.id);
    });

    it('should signin successfully with email', async () => {
      const emailAuthDto: EmailAuthDto = {
        email: 'user@example.com',
        loginMethod: 'email',
        username: 'user',
      };

      const userWithEmail = {
        ...mockUser,
        email: emailAuthDto.email,
        username: emailAuthDto.username,
      };

      mockAuthService.authenticate.mockResolvedValueOnce(userWithEmail);
      mockAuthService.login.mockReturnValueOnce(mockTokenResponse);

      const result = await controller.signin(emailAuthDto);

      expect(result).toEqual(mockTokenResponse);
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(emailAuthDto);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException when validation fails', async () => {
      const signinDto: Web3AuthLoginDto = {
        address: '0x456',
        loginMethod: 'metamask',
        username: undefined,
      };

      mockAuthService.authenticate.mockImplementationOnce((): never => {
        throw new UnauthorizedException('Invalid signin');
      });

      await expect(controller.signin(signinDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when email signin fails', async () => {
      const emailAuthDto: EmailAuthDto = {
        email: 'user@example.com',
        loginMethod: 'email',
        username: undefined,
      };

      mockAuthService.authenticate.mockImplementationOnce((): never => {
        throw new UnauthorizedException('Email authentication failed');
      });

      await expect(controller.signin(emailAuthDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return token response when refresh token is valid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'valid-refresh-token',
      };

      mockAuthService.refreshToken.mockReturnValueOnce(mockTokenResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(mockTokenResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refresh_token,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'invalid-refresh-token',
      };

      mockAuthService.refreshToken.mockImplementationOnce((): never => {
        throw new UnauthorizedException('Invalid refresh token');
      });

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('connectWallet', () => {
    const mockReq = {
      user: mockUser,
      // Добавляем минимальные необходимые свойства Request для прохождения типизации
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
    } as unknown as Request & { user: User };

    it('should connect wallet successfully', async () => {
      const connectWalletDto: ConnectWalletDto = {
        address: '0x9876543210fedcba',
        loginMethod: 'metamask',
      };

      mockAuthService.connectWallet.mockResolvedValueOnce({
        ...mockUser,
        address: connectWalletDto.address,
      });

      const result = await controller.connectWallet(mockReq, connectWalletDto);

      expect(result).toEqual({
        ...mockUser,
        address: connectWalletDto.address,
      });
      expect(mockAuthService.connectWallet).toHaveBeenCalledWith(
        mockUser.id,
        connectWalletDto.address,
        connectWalletDto.loginMethod,
      );
    });

    it('should throw error when wallet is already connected to another account', async () => {
      const connectWalletDto: ConnectWalletDto = {
        address: '0x9876543210fedcba',
        loginMethod: 'metamask',
      };

      mockAuthService.connectWallet.mockImplementationOnce((): never => {
        throw new Error('Wallet address already connected to another account');
      });

      await expect(
        controller.connectWallet(mockReq, connectWalletDto),
      ).rejects.toThrow('Wallet address already connected to another account');
    });
  });

  describe('verifyEmail', () => {
    const verifiedUser: User = {
      ...mockUser,
      email: 'test@example.com',
      isEmailVerified: true,
      emailVerifyToken: null,
    };

    const verifyEmailDto: VerifyEmailDto = {
      token: 'valid-verification-token',
    };

    it('should verify email and return user with success message', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(verifiedUser);

      const result = await controller.verifyEmail(verifyEmailDto);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
        verifyEmailDto.token,
      );
      expect(result).toEqual({
        id: verifiedUser.id,
        email: verifiedUser.email,
        isEmailVerified: true,
        message: 'Email successfully verified',
      });
    });

    it('should throw NotFoundException when token is invalid', async () => {
      const notFoundError = new NotFoundException(
        'Токен верификации не найден или устарел',
      );
      mockAuthService.verifyEmail.mockRejectedValue(notFoundError);

      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException on other errors', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(
        new Error('Some internal error'),
      );

      await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
