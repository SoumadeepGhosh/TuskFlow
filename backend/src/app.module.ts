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
import { ProjectMemberModule } from './modules/project-member/project-member.module';
import { BoardModule } from './modules/board/board.module';
import { BoardColumnModule } from './modules/board-column/board-column.module';
import { TaskModule } from './modules/task/task.module';
import { CommentModule } from './modules/comment/comment.module';
import { TaskAssigneeModule } from './modules/task-assignee/task-assignee.module';
import { LabelModule } from './modules/label/label.module';
import { TaskLabelModule } from './modules/task-label/task-label.module';
import { ActivityModule } from './modules/activity/activity.module';
import { StorageModule } from './common/storage';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { EmailModule } from './modules/email/email.module';
import { SocketModule } from './modules/socket/socket.module';
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
    StorageModule,
    HealthModule,
    AuthModule,
    PrismaModule,
    PasswordModule,
    TokenModule,
    WorkspaceModule,
    WorkspaceMemberModule,
    ProjectModule,
    ProjectMemberModule,
    BoardModule,
    BoardColumnModule,
    TaskModule,
    CommentModule,
    TaskAssigneeModule,
    LabelModule,
    TaskLabelModule,
    ActivityModule,
    AttachmentModule,
    NotificationModule,
    EmailModule,
    SocketModule,
  ],
})
export class AppModule {}
