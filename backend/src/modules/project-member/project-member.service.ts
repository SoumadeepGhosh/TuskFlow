/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  AddProjectMemberDto,
  ProjectMemberPaginationDto,
  UpdateProjectMemberRoleDto,
} from './dto/request.dto';

import { ProjectMemberRepository } from './repositories/project-member.repository';

@Injectable()
export class ProjectMemberService {
  constructor(
    private readonly projectMemberRepository: ProjectMemberRepository,
  ) {}

  async addMember(projectId: number, dto: AddProjectMemberDto) {
    const project = await this.projectMemberRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.projectMemberRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const member = await this.projectMemberRepository.findMember(
      projectId,
      user.id,
    );

    if (member) {
      throw new ConflictException('User is already a project member');
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

  async updateRole(memberId: number, dto: UpdateProjectMemberRoleDto) {
    const member = await this.projectMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    return this.projectMemberRepository.updateRole(memberId, dto.role);
  }

  async removeMember(memberId: number) {
    const member = await this.projectMemberRepository.findMemberById(memberId);

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    await this.projectMemberRepository.removeMember(memberId);

    return {
      message: 'Project member removed successfully',
    };
  }
}
