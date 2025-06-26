import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  TokenResponseSchema,
  ErrorResponseSchema,
  ValidationErrorResponseSchema,
  UserResponseSchema,
} from './auth.response.schema';
import {
  RefreshTokenDto,
  ConnectWalletDto,
  AuthLoginDto,
} from '../dto/auth.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

export function SwaggerAuthSignin() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Authenticate user with wallet or email',
      description:
        'Universal authentication endpoint that handles both existing users and new registrations. ' +
        'Supports wallet authentication (MetaMask, WalletConnect) and email-based methods.',
    }),
    ApiBody({
      schema: {
        $ref: '#/components/schemas/AuthLoginDto',
      },
      examples: {
        'wallet-authentication': {
          summary: 'Wallet Authentication Example',
          description: 'Example for authenticating with a wallet address (MetaMask or WalletConnect)',
          value: {
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            loginMethod: 'metamask',
            username: 'crypto_user123', // Optional
          },
        },
        'email-authentication': {
          summary: 'Email Authentication Example',
          description: 'Example for authenticating with an email address and verification',
          value: {
            email: 'user@example.com',
            loginMethod: 'email',
            username: 'regular_user123', // Optional
          },
        },
        'social-authentication': {
          summary: 'Social Authentication Example',
          description: 'Example for authenticating with a social provider',
          value: {
            email: 'user@example.com',
            loginMethod: 'google',
            username: 'social_user123', // Optional
          },
        },
        'wallet-connect-authentication': {
          summary: 'WalletConnect Authentication Example',
          description: 'Example for authenticating with WalletConnect',
          value: {
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            loginMethod: 'wallet_connect',
            username: 'wallet_user456', // Optional
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully authenticated',
      type: TokenResponseSchema,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication failed',
      type: ErrorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: ValidationErrorResponseSchema,
    }),
  );
}

export function SwaggerAuthRefreshToken() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Refresh authentication token',
      description:
        'Uses a valid refresh token to generate a new pair of access and refresh ' +
        'tokens. Used when an access token has expired.',
    }),
    ApiBody({ type: RefreshTokenDto }),
    ApiResponse({
      status: 201,
      description: 'Tokens successfully refreshed',
      type: TokenResponseSchema,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired refresh token',
      type: ErrorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: ValidationErrorResponseSchema,
    }),
  );
}

export function SwaggerEmailAuth() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Authenticate user with email',
      description:
        'Allows users to authenticate using their email address and social login methods. ' +
        'Creates a new user if one does not exist with the provided email.',
    }),
    ApiBody({ type: AuthLoginDto }),
    ApiResponse({
      status: 201,
      description: 'User successfully authenticated',
      type: TokenResponseSchema,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication failed',
      type: ErrorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: ValidationErrorResponseSchema,
    }),
  );
}

export function SwaggerConnectWallet() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Connect wallet to existing account',
      description:
        'Connect a Web3 wallet address to an existing authenticated user account.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: ConnectWalletDto }),
    ApiResponse({
      status: 201,
      description: 'Wallet successfully connected to account',
      type: UserResponseSchema,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication failed or invalid wallet address',
      type: ErrorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: ValidationErrorResponseSchema,
    }),
  );
}

export function SwaggerVerifyEmail() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Verify user email address',
      description:
        "Verifies a user's email address using the token sent to their email during registration.",
    }),
    ApiBody({ type: VerifyEmailDto }),
    ApiResponse({
      status: 200,
      description: 'Email successfully verified',
      type: UserResponseSchema,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired verification token',
      type: ErrorResponseSchema,
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      type: ValidationErrorResponseSchema,
    }),
  );
}
