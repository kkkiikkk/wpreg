import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'ruddnovskiy@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'reqh kjeu szjx vlht ',
  },
  from: process.env.EMAIL_FROM || 'noreply@example.com',
}));
