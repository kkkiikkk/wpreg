import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import {
  TokenResponseSchema,
  ErrorResponseSchema,
  ValidationErrorResponseSchema,
  UsernameResponseSchema,
} from './auth.response.schema';
import { RefreshTokenDto } from '../dto/auth.dto';

export function SwaggerAuthSignin() {
  return applyDecorators(
    ApiTags('auth'),
    ApiOperation({
      summary: 'Authenticate user with Web3Auth',
      description:
        'Authentication endpoint that handles both existing users and new registrations ' +
        'using Web3Auth (including social logins and wallet authentication).',
    }),
    ApiBody({
      schema: {
        $ref: '#/components/schemas/AuthLoginDto',
      },
      examples: {
        'social-authentication': {
          summary: 'Social Authentication Example',
          description:
            'Example for authenticating with a Web3Auth social provider',
          value: {
            idToken:
              'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRzIjpbeyJhZGRyZXNzIjoiMHg3MUM3NjU2RUM3YWI4OGIwOThkZWZCNzUxQjc0MDFCNWY2ZDg5NzZGIiwidHlwZSI6ImV0aGVyZXVtIn1dLCJhdWQiOiJXRUIzQVVUSF9DTElFTlRfSUQiLCJleHAiOjE3MDAwMDAwMDB9.signature',
            loginMethod: 'google',
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
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully authenticated with tokens',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/TokenResponseSchema',
          },
          examples: {
            tokens: {
              value: new TokenResponseSchema(),
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
