/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';

import { ActivityRepository } from './repositories/activity.repository';

import { ActivityPaginationDto, CreateActivityDto } from './dto/request.dto';

import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async create(dto: CreateActivityDto, user: JwtPayload) {
    return this.activityRepository.create({
      action: dto.action,
      oldValue: dto.oldValue as any,
      newValue: dto.newValue as any,
      metadata: dto.metadata as any,

      user: {
        connect: {
          id: user.sub,
        },
      },

      workspace: dto.workspaceId
        ? {
            connect: {
              id: dto.workspaceId,
            },
          }
        : undefined,

      project: dto.projectId
        ? {
            connect: {
              id: dto.projectId,
            },
          }
        : undefined,

      task: dto.taskId
        ? {
            connect: {
              id: dto.taskId,
            },
          }
        : undefined,
    });
  }

  async findAll(dto: ActivityPaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.activityRepository.findAll(skip, limit),
      this.activityRepository.count(),
    ]);

    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async findTaskActivities(taskId: number, dto: ActivityPaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    return this.activityRepository.findByTask(
      taskId,
      (page - 1) * limit,
      limit,
    );
  }

  async findProjectActivities(projectId: number, dto: ActivityPaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    return this.activityRepository.findByProject(
      projectId,
      (page - 1) * limit,
      limit,
    );
  }

  async findWorkspaceActivities(
    workspaceId: number,
    dto: ActivityPaginationDto,
  ) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    return this.activityRepository.findByWorkspace(
      workspaceId,
      (page - 1) * limit,
      limit,
    );
  }

  async findMyActivities(user: JwtPayload, dto: ActivityPaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    return this.activityRepository.findByUser(
      user.sub,
      (page - 1) * limit,
      limit,
    );
  }

  async searchByAction(action: string, dto: ActivityPaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    return this.activityRepository.findByAction(
      action,
      (page - 1) * limit,
      limit,
    );
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.activityRepository.delete(id);
  }
}
