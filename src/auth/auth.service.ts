import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';
import { AuthLoginDto } from './dto/auth.dto';
import { Web3AuthService } from './web3auth.service';

interface JwtPayload {
  userId: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  username?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private web3AuthService: Web3AuthService,
  ) {}

  async authenticate(authData: AuthLoginDto): Promise<any> {
    const web3AuthData: any = await this.web3AuthService.verifyWeb3AuthToken(
      authData.idToken,
    );

    const loginMethodType = this.getLoginMethodType(web3AuthData);
    let wallet: string = '';
    if (loginMethodType === 'social') {
      wallet = this.web3AuthService.getWallet(web3AuthData?.wallets);
    }

    if (loginMethodType === 'wallet') {
      wallet = web3AuthData?.wallets[0].address as string;
    }

    let user = await this.userService.findByAddress(wallet);

    if (!user) {
      user = await this.userService.createUser({
        email: web3AuthData?.email || '',
        address: wallet,
        loginMethod: web3AuthData.aggregateVerifier || web3AuthData.iss,
      });
    }

    return user;
  }

  login(userId: string): TokenResponse {
    const payload: JwtPayload = { userId };
    const accessTokenExpiresIn =
      this.configService.get<number>('jwt.accessTokenExpiresIn') || 3600;
    const refreshTokenExpiresIn =
      this.configService.get<number>('jwt.refreshTokenExpiresIn') || 604800;

    const access_token = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    const refresh_token = this.jwtService.sign(
      { ...payload, refresh: true },
      { expiresIn: refreshTokenExpiresIn },
    );

    return {
      access_token,
      refresh_token,
      expires_in: accessTokenExpiresIn,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<
        JwtPayload & { refresh: boolean }
      >(refreshToken);

      if (!payload || !payload.refresh) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.login(user.id);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return this.userService.findById(payload.userId);
    } catch {
      return null;
    }
  }

  async generateUsername(base = 'user'): Promise<string> {
    return this.userService.generateUniqueUsername(base);
  }

  private getLoginMethodType(data): 'social' | 'wallet' {
    if (data.aggregateVerifier) {
      return 'social';
    }

    return 'wallet';
  }
}
