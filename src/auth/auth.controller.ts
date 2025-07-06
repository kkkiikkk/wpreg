import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService, TokenResponse } from './auth.service';
import { AuthLoginDto, RefreshTokenDto } from './dto/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  SwaggerAuthSignin,
  SwaggerAuthRefreshToken,
  SwaggerUsernameSuggest,
} from './swagger/auth.controller.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @SwaggerAuthSignin()
  async signin(@Body() signinData: AuthLoginDto): Promise<TokenResponse> {
    try {
      const user = await this.authService.authenticate(signinData);

      return this.authService.login(user.id, user.username || undefined);
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

  @Get('username-suggest')
  @SwaggerUsernameSuggest()
  async usernameSuggest(@Query('base') base?: string) {
    const username = await this.authService.generateUsername(base);
    return { username };
  }
}
