import {
  IsString,
  IsEthereumAddress,
  IsOptional,
  Matches,
  IsNotEmpty,
  Length,
  IsEnum,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Combined authentication DTO for both email and wallet authentication
 */
export class AuthLoginDto {
  @ApiProperty({
    description: 'Email address of the user (required for email/social login)',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Ethereum address of the user (required for wallet authentication)',
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    required: false,
  })
  @IsEthereumAddress()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Method used for authentication',
    example: 'email',
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
  @IsEnum([
    'email',
    'google',
    'facebook',
    'twitter',
    'metamask',
    'wallet_connect',
  ])
  @IsNotEmpty({ message: 'Login method is required' })
  loginMethod: string;

  @ApiProperty({
    description: 'Optional username',
    example: 'user123',
    required: false,
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsOptional()
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
}

// Email-based authentication DTO
export class EmailAuthDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Method used for social login',
    example: 'google',
    enum: ['email', 'google', 'facebook', 'twitter'],
  })
  @IsString()
  @IsEnum(['email', 'google', 'facebook', 'twitter'])
  @IsNotEmpty()
  loginMethod: string;

  @ApiProperty({
    description: 'Optional username',
    example: 'user123',
    required: false,
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsOptional()
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
}

/**
 * DTO for Ethereum wallet authentication
 */
export class Web3AuthLoginDto {
  @ApiProperty({
    description: 'Ethereum address of the user',
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  })
  @IsEthereumAddress()
  @IsNotEmpty({ message: 'Ethereum address is required' })
  address: string;

  @ApiProperty({
    description: 'Method used for wallet connection',
    example: 'metamask',
    enum: ['metamask', 'wallet_connect'],
  })
  @IsString()
  @IsEnum(['metamask', 'wallet_connect'])
  @IsNotEmpty({ message: 'Login method is required' })
  loginMethod: string;

  @ApiProperty({
    description: 'Optional username',
    example: 'user123',
    required: false,
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsOptional()
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
}

/**
 * DTO for connecting wallet to existing account
 */
export class ConnectWalletDto {
  @ApiProperty({
    description: 'Ethereum address of the user',
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  })
  @IsEthereumAddress()
  @IsNotEmpty({ message: 'Ethereum address is required' })
  address: string;

  @ApiProperty({
    description: 'Method used for wallet connection',
    example: 'metamask',
    enum: ['metamask', 'wallet_connect'],
  })
  @IsString()
  @IsEnum(['metamask', 'wallet_connect'])
  @IsNotEmpty({ message: 'Login method is required' })
  loginMethod: string;
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
