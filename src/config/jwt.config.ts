import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'supersecretkey',
  accessTokenExpiresIn: parseInt(
    process.env.JWT_ACCESS_EXPIRES_IN || '3600',
    10,
  ),
  refreshTokenExpiresIn: parseInt(
    process.env.JWT_REFRESH_EXPIRES_IN || '604800',
    10,
  ),
}));
