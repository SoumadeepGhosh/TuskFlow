import { Injectable } from '@nestjs/common';
import { Prisma, Attachment } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AttachmentCreateInput): Promise<Attachment> {
    return this.prisma.attachment.create({
      data,
    });
  }

  async findById(id: number): Promise<Attachment | null> {
    return this.prisma.attachment.findUnique({
      where: { id },
    });
  }

  async findManyByTaskId(taskId: number): Promise<Attachment[]> {
    return this.prisma.attachment.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async exists(id: number): Promise<boolean> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    return !!attachment;
  }

  async delete(id: number): Promise<Attachment> {
    return this.prisma.attachment.delete({
      where: {
        id,
      },
    });
  }

  async countByTaskId(taskId: number): Promise<number> {
    return this.prisma.attachment.count({
      where: {
        taskId,
      },
    });
  }
}
