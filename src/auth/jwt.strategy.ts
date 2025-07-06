import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { JwtConfig, JwtPayload } from './auth.types';
import { User } from '../user/user.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') ||
        'a-very-long-and-secure-secret-key-that-is-at-least-256-bits-long-for-jwt-signing',
    } as JwtConfig);
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
