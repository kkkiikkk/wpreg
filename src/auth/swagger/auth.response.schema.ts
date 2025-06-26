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
}

export class UserResponseSchema {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'user-id-1',
  })
  id: string;

  @ApiProperty({
    description: 'Ethereum address of the user',
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  })
  address: string;

  @ApiProperty({
    description: 'Username chosen by the user',
    example: 'cryptouser',
    nullable: true,
  })
  username?: string;

  @ApiProperty({
    description: 'Login method used by the user',
    example: 'metamask',
  })
  loginMethod: string;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-01-15T10:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-01-15T10:30:45.123Z',
  })
  updatedAt: Date;
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
