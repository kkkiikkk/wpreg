import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret:
    process.env.JWT_SECRET ||
    'a-very-long-and-secure-secret-key-that-is-at-least-256-bits-long-for-jwt-signing',
  accessTokenExpiresIn: parseInt(
    process.env.JWT_ACCESS_EXPIRES_IN || '36000',
    10,
  ),
  refreshTokenExpiresIn: parseInt(
    process.env.JWT_REFRESH_EXPIRES_IN || '604800',
    10,
  ),
}));
