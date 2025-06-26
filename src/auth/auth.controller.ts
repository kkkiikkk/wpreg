import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AuthService, TokenResponse } from './auth.service';
import {
  AuthLoginDto,
  RefreshTokenDto,
  ConnectWalletDto,
} from './dto/auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { User } from '../user/user.types';
import {
  SwaggerAuthSignin,
  SwaggerAuthRefreshToken,
  SwaggerConnectWallet,
  SwaggerVerifyEmail,
} from './swagger/auth.controller.decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @SwaggerAuthSignin()
  async signin(@Body() signinData: AuthLoginDto): Promise<TokenResponse> {
    try {
      const user = await this.authService.authenticate(signinData);
      return this.authService.login(user.id);
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }

  @Post('refresh')
  @SwaggerAuthRefreshToken()
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    try {
      return await this.authService.refreshToken(refreshTokenDto.refresh_token);
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid refresh token');
    }
  }

  @Post('connect-wallet')
  @UseGuards(JwtAuthGuard)
  @SwaggerConnectWallet()
  async connectWallet(
    @Req() req: ExpressRequest & { user: User },
    @Body() connectWalletDto: ConnectWalletDto,
  ) {
    try {
      const userId = req.user.id;

      return this.authService.connectWallet(
        userId,
        connectWalletDto.address,
        connectWalletDto.loginMethod,
      );
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Failed to connect wallet',
      );
    }
  }

  @Post('verify-email')
  @SwaggerVerifyEmail()
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    try {
      const user = await this.authService.verifyEmail(verifyEmailDto.token);
      return {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        message: 'Email successfully verified',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException(
        error.message || 'Email verification failed',
      );
    }
  }
}
