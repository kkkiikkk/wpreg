import {
  IsString,
  IsOptional,
  Matches,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for Web3Auth authentication
 */
export class AuthLoginDto {
  @ApiProperty({
    description: 'Method used for authentication',
    example: 'google',
    enum: [
      'email',
      'google',
      'facebook',
      'twitter',
      'metamask',
      'wallet_connect',
    ],
  })
  @IsString()
  loginMethod: string;

  @ApiProperty({
    description: 'Optional username',
    example: 'user123',
    required: false,
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @Length(3, 30, {
    message: 'Username must be between 3 and 30 characters',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @Transform(({ value }: { value: string | undefined }): string | undefined => {
    return value?.trim();
  })
  username?: string;

  @ApiProperty({
    description: 'Web3Auth ID token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'IdToken is required' })
  idToken: string;
}

/**
 * DTO for token refresh
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token used to get a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refresh_token: string;
}
