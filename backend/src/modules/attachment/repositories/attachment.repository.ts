import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTask(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    });
  }

  createAttachment(data: {
    taskId: number;
    uploadedBy: number;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }) {
    return this.prisma.attachment.create({
      data,
    });
  }

  findAttachments(taskId: number, page = 1, limit = 20) {
    return this.prisma.attachment.findMany({
      where: {
        taskId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  countAttachments(taskId: number) {
    return this.prisma.attachment.count({
      where: {
        taskId,
      },
    });
  }

  findAttachmentById(id: number) {
    return this.prisma.attachment.findUnique({
      where: {
        id,
      },
    });
  }

  deleteAttachment(id: number) {
    return this.prisma.attachment.delete({
      where: {
        id,
      },
    });
  }
}
