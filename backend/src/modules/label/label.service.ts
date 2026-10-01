import { Injectable, NotFoundException } from '@nestjs/common';
import { LabelRepository } from './repositories/label.repository';
import { CreateLabelDto, LabelQueryDto, UpdateLabelDto } from './dto/request.dto';

@Injectable()
export class LabelService {
  constructor(private readonly labelRepository: LabelRepository) {}

  async create(dto: CreateLabelDto) {
    const project = await this.labelRepository.findProject(dto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.labelRepository.createLabel({
      projectId: dto.projectId,
      name: dto.name,
      color: dto.color,
    });
  }

  async findAll(query: LabelQueryDto) {
    if (query.projectId) {
      const project = await this.labelRepository.findProject(query.projectId);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const labels = await this.labelRepository.findLabels(
      query.projectId,
      query.page,
      query.limit,
    );

    const total = await this.labelRepository.countLabels(query.projectId);

    return {
      items: labels,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(id: number, dto: UpdateLabelDto) {
    const label = await this.labelRepository.findLabelById(id);
    if (!label) {
      throw new NotFoundException('Label not found');
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
