import { IsString, IsNotEmpty } from 'class-validator';
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
