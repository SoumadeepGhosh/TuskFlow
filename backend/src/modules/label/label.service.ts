import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { LabelRepository } from './repositories/label.repository';

import {
  CreateLabelDto,
  LabelPaginationDto,
  UpdateLabelDto,
} from './dto/request.dto';

@Injectable()
export class LabelService {
  constructor(private readonly labelRepository: LabelRepository) {}

  async create(projectId: number, dto: CreateLabelDto) {
    const project = await this.labelRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existing = await this.labelRepository.existsByName(
      projectId,
      dto.name,
    );

    if (existing) {
      throw new BadRequestException('Label already exists');
    }

    return this.labelRepository.createLabel({
      projectId,
      name: dto.name,
      color: dto.color,
    });
  }

  async findAll(projectId: number, pagination: LabelPaginationDto) {
    const project = await this.labelRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const labels = await this.labelRepository.findLabels(
      projectId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.labelRepository.countLabels(projectId);

    return {
      items: labels,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number) {
    const label = await this.labelRepository.findLabelById(id);

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  async update(id: number, dto: UpdateLabelDto) {
    const label = await this.labelRepository.findLabelById(id);

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    if (dto.name && dto.name !== label.name) {
      const existing = await this.labelRepository.existsByName(
        label.projectId,
        dto.name,
      );

      if (existing) {
        throw new BadRequestException('Label already exists');
      }
    }

    return this.labelRepository.updateLabel(id, {
      name: dto.name,
      color: dto.color,
    });
  }

  async remove(id: number) {
    const label = await this.labelRepository.findLabelById(id);

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    await this.labelRepository.deleteLabel(id);

    return {
      message: 'Label deleted successfully',
    };
  }
}
