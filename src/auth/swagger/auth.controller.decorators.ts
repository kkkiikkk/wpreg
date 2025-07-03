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
  UsernameResponseSchema,
  EmailVerificationRequiredSchema,
} from './auth.response.schema';
import { RefreshTokenDto, ConnectWalletDto } from '../dto/auth.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

export function SwaggerAuthSignin() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Authenticate user with Web3Auth or email',
      description:
        'Universal authentication endpoint that handles both existing users and new registrations. ' +
        'Supports Web3Auth (including social logins, wallet authentication) and direct email authentication.',
    }),
    ApiBody({
      schema: {
        $ref: '#/components/schemas/AuthLoginDto',
      },
      examples: {
        'wallet-authentication': {
          summary: 'Wallet Authentication Example',
          description:
            'Authenticate with Web3Auth idToken (returned from web3auth.authenticateUser())',
          value: {
            idToken:
              'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRzIjpbeyJhZGRyZXNzIjoiMHg3MUM3NjU2RUM3YWI4OGIwOThkZWZCNzUxQjc0MDFCNWY2ZDg5NzZGIiwidHlwZSI6ImV0aGVyZXVtIn1dLCJhdWQiOiJXRUIzQVVUSF9DTElFTlRfSUQiLCJleHAiOjE3MDAwMDAwMDB9.signature',
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            loginMethod: 'metamask',
            username: 'crypto_user123',
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
          description:
            'Authenticate with Web3Auth idToken for WalletConnect session',
          value: {
            idToken:
              'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRzIjpbeyJhZGRyZXNzIjoiMHg4QUE2QjA1RkQ3OTk5QjcyNEIwRkZBMzJGM0ZDNkU0ODE5NzVBNTYiLCJ0eXBlIjoiZXRoZXJldW0ifV0sImF1ZCI6IldFQjNBVVRIX0NMSUVOVF9JRCIsImV4cCI6MTcwMDAwMDAwMH0.signature',
            loginMethod: 'wallet_connect',
            username: 'wallet_user456',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully authenticated with tokens or requires email verification',
      content: {
        
        'application/json': {
          schema: {
            oneOf: [
              { $ref: '#/components/schemas/TokenResponseSchema' },
              { $ref: '#/components/schemas/EmailVerificationRequiredSchema' },
            ],
            examples: {
              tokens: {
                value: new TokenResponseSchema(),
              },
              'email-verification': {
                value: new EmailVerificationRequiredSchema(),
              },
            },
          },
        },
      },
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

export function SwaggerConnectWallet() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Connect wallet to existing account',
      description:
        'Connect a Web3 wallet address to an existing authenticated user account. Requires authentication.',
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

export function SwaggerUsernameSuggest() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Suggest unique username',
      description:
        'Returns a unique username suggestion. Optionally accepts ?base=<string> query parameter.',
    }),
    ApiResponse({
      status: 200,
      description: 'Unique username suggestion',
      type: UsernameResponseSchema,
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
        "Verifies a user's email address using the verification code sent to their email when using direct email authentication.",
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
