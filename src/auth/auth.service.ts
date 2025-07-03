import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/user.types';
import { AuthLoginDto } from './dto/auth.dto';
import * as nodemailer from 'nodemailer';

interface JwtPayload {
  sub: string;
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
  ) {}

  async authenticate(authData: AuthLoginDto): Promise<User> {
    const { address, email, loginMethod, username } = authData;

    if (!address && !email) {
      throw new UnauthorizedException(
        'Either address or email must be provided',
      );
    }

    if (loginMethod === 'email') {
      if (!email) {
        throw new UnauthorizedException(
          'Email is required for email-based login methods',
        );
      }

      // Generate a verification code for each login attempt
      const emailVerifyToken = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      let user = await this.userService.findByEmail(email);

      if (!user) {
        // New user: create account with verification pending
        user = await this.userService.createUser({
          email,
          loginMethod,
          username,
          isEmailVerified: false,
          emailVerifyToken,
        });
      } else {
        // Existing user: update verification token and set verification pending
        user = await this.userService.updateUser(user.id, {
          emailVerifyToken,
          isEmailVerified: false, // Require verification every time
        });
      }

      // Send verification code on every login attempt
      await this.sendVerificationEmail(email, emailVerifyToken);

      return user;
    } else {
      // Wallet-based authentication
      let user = await this.userService.findByAddress(address as string);

      if (!user) {
        user = await this.userService.createUser({
          address,
          loginMethod,
          username,
        });
      }

      return user;
    }
  }

  login(userId: string, username?: string): TokenResponse {
    const payload: JwtPayload = { sub: userId };
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
      username,
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

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.login(user.id, user.username ?? undefined);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return this.userService.findById(payload.sub);
    } catch {
      return null;
    }
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const emailConfig = this.configService.get('email');
    const verificationCode = code;
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });
    console.log(emailConfig);
    const mailOptions = {
      from: 'no-reply@example.com',
      to: email,
      subject: 'Email verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin: 30px 0;">
            <h1 style="font-size: 32px; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">${verificationCode}</h1>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }

  async verifyEmail(code: string): Promise<User> {
    const user = await this.userService.findByEmailVerifyToken(code);

    if (!user) {
      throw new NotFoundException('Verification code not found or expired');
    }
    const updatedUser = await this.userService.updateUser(user.id, {
      isEmailVerified: true,
      emailVerifyToken: undefined,
    });

    return updatedUser;
  }

  /**
   * Provide a unique username suggestion based on base string.
   */
  async generateUsername(base = 'user'): Promise<string> {
    return this.userService.generateUniqueUsername(base);
  }

  async connectWallet(
    userId: string,
    address: string,
    loginMethod: string,
  ): Promise<User> {
    const existingUserWithAddress =
      await this.userService.findByAddress(address);

    if (existingUserWithAddress && existingUserWithAddress.id !== userId) {
      throw new UnauthorizedException(
        'This wallet address is already connected to another account',
      );
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userService.updateUser(userId, {
      address,
      loginMethod,
    });
  }
}
