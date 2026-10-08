import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './common/logger/logger.module';
import configuration from './config/configuration';
import { validate } from './config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import * as fs from 'fs';
import { PasswordModule } from './common/password/password.module';
import { TokenModule } from './common/token/token.module';
import { StorageModule } from './common/storage/storage.module';

const getUploadPath = () => {
  const backendUploads = path.resolve(process.cwd(), 'backend', 'uploads');
  if (fs.existsSync(backendUploads)) return backendUploads;
  return path.resolve(process.cwd(), 'uploads');
};
import { QueueModule } from './modules/queue/queue.module';
import { EmailModule } from './modules/email/email.module';
import { SocketModule } from './modules/socket/socket.module';
import { NotificationDispatcherModule } from './modules/notification-dispatcher/notification-dispatcher.module';
import { NotificationQueueModule } from './modules/notification-queue/notification-queue.module';
import { NotificationModule } from './modules/notification/notification.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { WorkspaceMemberModule } from './modules/workspace-member/workspace-member.module';
import { WorkspaceInvitationModule } from './modules/workspace-invitation/workspace-invitation.module';
import { ProjectModule } from './modules/project/project.module';
import { ProjectMemberModule } from './modules/project-member/project-member.module';
import { BoardModule } from './modules/board/board.module';
import { BoardColumnModule } from './modules/board-column/board-column.module';
import { TaskModule } from './modules/task/task.module';
import { TaskAssigneeModule } from './modules/task-assignee/task-assignee.module';
import { TaskLabelModule } from './modules/task-label/task-label.module';
import { LabelModule } from './modules/label/label.module';
import { CommentModule } from './modules/comment/comment.module';
import { AttachmentModule } from './modules/attachment/attachment.module';

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
    ServeStaticModule.forRoot({
      rootPath: getUploadPath(),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    StorageModule,
    QueueModule,
    EmailModule,
    SocketModule,
    NotificationDispatcherModule,
    NotificationQueueModule,
    NotificationModule,
    WorkspaceModule,
    WorkspaceMemberModule,
    WorkspaceInvitationModule,
    ProjectModule,
    ProjectMemberModule,
    BoardModule,
    BoardColumnModule,
    TaskModule,
    TaskAssigneeModule,
    TaskLabelModule,
    LabelModule,
    CommentModule,
    AttachmentModule,
  ],
})
export class AppModule {}
