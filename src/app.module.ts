import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WebSocketModule } from './websocket/websocket.module';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, emailConfig],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    WebSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
