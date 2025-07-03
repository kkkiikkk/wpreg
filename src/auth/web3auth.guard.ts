import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { User } from '../user/user.types';

// Расширяем типы запроса Express
declare module 'express' {
  interface Request {
    user?: User | null;
  }
}

@Injectable()
export class Web3AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      const user = await this.authService.verifyToken(token);
      console.log('uSER', user)
      request.user = user;
      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
