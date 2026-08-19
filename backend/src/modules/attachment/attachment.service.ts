/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AttachmentRepository } from './repositories/attachment.repository';
import { StorageService } from 'src/common/storage';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentRepository: AttachmentRepository,
    private readonly storageService: StorageService,
  ) {}

  async upload(taskId: number, uploadedBy: number, file: any) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const uploadResult = await this.storageService.upload(
      'attachments',
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    const extension = file.originalname.includes('.')
      ? (file.originalname.split('.').pop()?.toLowerCase() ?? '')
      : '';

    const attachment = await this.attachmentRepository.create({
      task: {
        connect: {
          id: taskId,
        },
      },

      uploader: {
        connect: {
          id: uploadedBy,
        },
      },

      originalName: file.originalname,

      fileName: uploadResult.key.split('/').pop()!,

      storageKey: uploadResult.key,

      fileUrl: uploadResult.url,

      thumbnailUrl: null,

      mimeType: file.mimetype,

      fileExtension: extension,

      fileSize: file.size,

      isImage: file.mimetype.startsWith('image/'),
    });

    return attachment;
  }
}
