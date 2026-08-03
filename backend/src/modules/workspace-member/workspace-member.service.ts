/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  AddMemberDto,
  UpdateMemberRoleDto,
  UpdateMemberStatusDto,
} from './dto/request.dto';

import { WorkspaceMemberRepository } from './repositories/workspace-member.repository';
import { PaginationQueryDto } from 'src/common/dto/api-response.dto';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  async addMember(workspaceId: number, dto: AddMemberDto) {
    const workspace =
      await this.workspaceMemberRepository.findWorkspace(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const user = await this.workspaceMemberRepository.findUserByEmail(
      dto.email,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const member = await this.workspaceMemberRepository.findMember(
      workspaceId,
      user.id,
    );

    if (member) {
      throw new ConflictException('User is already a workspace member');
    }

    return this.workspaceMemberRepository.addMember(
      workspaceId,
      user.id,
      dto.role,
    );
  }

  async findMembers(workspaceId: number, pagination: PaginationQueryDto) {
    return this.workspaceMemberRepository.findMembers(
      workspaceId,
      pagination.page,
      pagination.limit,
    );
  }

  async updateRole(memberId: number, dto: UpdateMemberRoleDto) {
    const member =
      await this.workspaceMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.workspaceMemberRepository.updateRole(memberId, dto.role);
  }

  async updateStatus(memberId: number, dto: UpdateMemberStatusDto) {
    const member =
      await this.workspaceMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.workspaceMemberRepository.updateStatus(memberId, dto.status);
  }

  async removeMember(memberId: number) {
    const member =
      await this.workspaceMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.workspaceMemberRepository.removeMember(memberId);

    return {
      message: 'Member removed successfully',
    };
  }
}
