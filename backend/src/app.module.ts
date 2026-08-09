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
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { WorkspaceMemberModule } from './modules/workspace-member/workspace-member.module';
import { ProjectModule } from './modules/project/project.module';
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
    WorkspaceModule,
    WorkspaceMemberModule,
    ProjectModule,
  ],
})
export class AppModule {}
