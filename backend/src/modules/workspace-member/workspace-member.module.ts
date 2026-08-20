import { Module } from '@nestjs/common';
import { WorkspaceMemberController } from './workspace-member.controller';
import { WorkspaceMemberService } from './workspace-member.service';
import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';

@Module({
  controllers: [WorkspaceMemberController],
  providers: [WorkspaceMemberService, WorkspaceMemberRepository],
})
export class WorkspaceMemberModule {}
