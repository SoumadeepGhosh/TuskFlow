import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './common/logger/logger.module';
import configuration from './config/configuration';
import { validate } from './config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { PasswordModule } from './common/password/password.module';
import { TokenModule } from './common/token/token.module';
@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: '.env',
      load: configuration,
      validate,
    }),
    HealthModule,
    AuthModule,
    PrismaModule,
    PasswordModule,
    TokenModule,
  ],
})
export class AppModule {}
