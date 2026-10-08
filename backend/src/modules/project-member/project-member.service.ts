import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberStatus, ProjectRole, WorkspaceRole } from '@prisma/client';

import {
  AddProjectMemberDto,
  ProjectMemberPaginationDto,
  UpdateProjectMemberRoleDto,
} from './dto/request.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ProjectMemberRepository } from './repositories/project-member.repository';

@Injectable()
export class ProjectMemberService {
  constructor(
    private readonly projectMemberRepository: ProjectMemberRepository,
  ) {}

  private async assertCanManageMembers(projectId: number, userId: number) {
    const project =
      await this.projectMemberRepository.findProject(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspace?.ownerId === userId) {
      return project;
    }

    const wsMember = await this.projectMemberRepository.findWorkspaceMember(
      project.workspaceId,
      userId,
    );
    if (
      wsMember &&
      wsMember.status === MemberStatus.ACTIVE &&
      (wsMember.role === WorkspaceRole.OWNER ||
        wsMember.role === WorkspaceRole.ADMIN)
    ) {
      return project;
    }

    if (project.createdBy === userId) {
      return project;
    }

    const member = await this.projectMemberRepository.findMember(
      projectId,
      userId,
    );
    if (
      !member ||
      (member.role !== ProjectRole.OWNER && member.role !== ProjectRole.MANAGER)
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage members of this project',
      );
    }

    return project;
  }

  async addMember(
    projectId: number,
    dto: AddProjectMemberDto,
    caller: JwtPayload,
  ) {
    const project = await this.assertCanManageMembers(projectId, caller.sub);

    const email = dto.email.trim().toLowerCase();
    const user = await this.projectMemberRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`);
    }

    // Tenant check: Target user must be an active member or owner of the workspace
    const isWsOwner = project.workspace?.ownerId === user.id;
    const wsMember = await this.projectMemberRepository.findWorkspaceMember(
      project.workspaceId,
      user.id,
    );

    if (!isWsOwner && (!wsMember || wsMember.status !== MemberStatus.ACTIVE)) {
      throw new BadRequestException(
        'User must be an active member of this workspace before joining the project',
      );
    }

    const existingMember = await this.projectMemberRepository.findMember(
      projectId,
      user.id,
    );

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    return this.projectMemberRepository.addMember(projectId, user.id, dto.role);
  }

  async findMembers(projectId: number, pagination: ProjectMemberPaginationDto) {
    const project = await this.projectMemberRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const members = await this.projectMemberRepository.findMembers(
      projectId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.projectMemberRepository.countMembers(projectId);

    return {
      items: members,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async updateRole(
    memberId: number,
    dto: UpdateProjectMemberRoleDto,
    caller: JwtPayload,
  ) {
    const member = await this.projectMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    await this.assertCanManageMembers(member.projectId, caller.sub);

    // Prevent demoting the only owner of the project
    if (member.role === ProjectRole.OWNER && dto.role !== ProjectRole.OWNER) {
      const ownerCount = await this.projectMemberRepository.countOwners(
        member.projectId,
      );
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot change role: A project must have at least one owner',
        );
      }
    }

    return this.projectMemberRepository.updateRole(memberId, dto.role);
  }

  async removeMember(memberId: number, caller: JwtPayload) {
    const member = await this.projectMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    // Allow user to leave project themselves, otherwise require management permission
    if (member.userId !== caller.sub) {
      await this.assertCanManageMembers(member.projectId, caller.sub);
    }

    // Prevent removing the only owner of the project
    if (member.role === ProjectRole.OWNER) {
      const ownerCount = await this.projectMemberRepository.countOwners(
        member.projectId,
      );
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Cannot remove member: A project must have at least one owner',
        );
      }
    }

    await this.projectMemberRepository.removeMember(memberId);

    return {
      message: 'Project member removed successfully',
    };
  }
}
