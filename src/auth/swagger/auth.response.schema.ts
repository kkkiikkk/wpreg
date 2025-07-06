import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseSchema {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Username associated with the authenticated user',
    example: 'user_1234',
  })
  username: string;

  @ApiProperty({
    description: 'Seconds until the access token expires',
    example: 3600,
  })
  expires_in: number;
}

export class UsernameResponseSchema {
  @ApiProperty({
    description: 'Suggested unique username',
    example: 'user_4821',
  })
  username: string;
}

export class ErrorResponseSchema {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid credentials',
  })
  message: string;

  @ApiProperty({
    description: 'Error name',
    example: 'Unauthorized',
  })
  error: string;
}

export class ValidationErrorResponseSchema {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Array of validation error messages',
    example: [
      'address must be a valid Ethereum address',
      'loginMethod should not be empty',
    ],
  })
  message: string[];

  @ApiProperty({
    description: 'Error name',
    example: 'Bad Request',
  })
  error: string;
}
