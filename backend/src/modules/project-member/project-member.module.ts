import { Module } from '@nestjs/common';
import { ProjectMemberController } from './project-member.controller';
import { ProjectMemberService } from './project-member.service';
import { ProjectMemberRepository } from './repositories/project-member.repository';

@Module({
  controllers: [ProjectMemberController],
  providers: [ProjectMemberService, ProjectMemberRepository],
})
export class ProjectMemberModule {}
