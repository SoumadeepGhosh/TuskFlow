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

  async findManyByTaskId(
    taskId: number,
    options: {
      page: number;
      limit: number;
      keyword?: string;
      extension?: string;
      uploadedBy?: number;
      sortBy: 'createdAt' | 'originalName' | 'fileSize';
      sortOrder: 'asc' | 'desc';
    },
  ) {
    const { page, limit, keyword, extension, uploadedBy, sortBy, sortOrder } =
      options;

    const where: Prisma.AttachmentWhereInput = {
      taskId,
    };

    if (keyword) {
      where.originalName = {
        contains: keyword,
        mode: 'insensitive',
      };
    }

    if (extension) {
      where.fileExtension = extension.toLowerCase();
    }

    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    const [attachments, total] = await this.prisma.$transaction([
      this.prisma.attachment.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.attachment.count({
        where,
      }),
    ]);

    return {
      data: attachments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async findAllByTaskId(taskId: number) {
    return this.prisma.attachment.findMany({
      where: {
        taskId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async rename(id: number, originalName: string) {
    return this.prisma.attachment.update({
      where: {
        id,
      },
      data: {
        originalName,
      },
    });
  }

  async getStatistics(taskId: number) {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        taskId,
      },
    });

    const totalAttachments = attachments.length;

    const totalSize = attachments.reduce((sum, item) => sum + item.fileSize, 0);

    const imageCount = attachments.filter((item) => item.isImage).length;

    const documentCount = totalAttachments - imageCount;

    const averageFileSize =
      totalAttachments === 0 ? 0 : Math.round(totalSize / totalAttachments);

    const largestFile =
      attachments.length > 0
        ? attachments.reduce((prev, curr) =>
            prev.fileSize > curr.fileSize ? prev : curr,
          )
        : null;

    const extensionBreakdown = attachments.reduce(
      (acc, item) => {
        acc[item.fileExtension] = (acc[item.fileExtension] ?? 0) + 1;

        return acc;
      },
      {} as Record<string, number>,
    );

    const uploadedByBreakdown = attachments.reduce(
      (acc, item) => {
        acc[item.uploadedBy] = (acc[item.uploadedBy] ?? 0) + 1;

        return acc;
      },
      {} as Record<number, number>,
    );

    return {
      totalAttachments,
      totalSize,
      averageFileSize,
      imageCount,
      documentCount,
      largestFile,
      extensionBreakdown,
      uploadedByBreakdown,
    };
  }
}
