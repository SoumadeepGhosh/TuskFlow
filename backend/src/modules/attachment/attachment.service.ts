/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AttachmentRepository } from './repositories/attachment.repository';
import { StorageService } from 'src/common/storage';
import { AttachmentPaginationDto } from './dto/request.dto';
import { AppLoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachmentRepository: AttachmentRepository,
    private readonly storageService: StorageService,
    private readonly logger: AppLoggerService,
  ) {}

  async upload(taskId: number, uploadedBy: number, file: any) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }
    this.logger.log('Attachment upload started', AttachmentService.name, {
      taskId,
      uploadedBy,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Maximum file size is 20 MB.');
    }

    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'application/zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type.');
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
    this.logger.log(
      'Attachment uploaded successfully',
      AttachmentService.name,
      {
        attachmentId: attachment.id,
        taskId,
        uploadedBy,
        storageKey: attachment.storageKey,
      },
    );

    return attachment;
  }

  async findAll(taskId: number, query: AttachmentPaginationDto) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }
    this.logger.log('Attachment list fetched', AttachmentService.name, {
      taskId,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      keyword: query.keyword,
      extension: query.extension,
      uploadedBy: query.uploadedBy,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
    });
    return this.attachmentRepository.findManyByTaskId(taskId, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      keyword: query.keyword,
      extension: query.extension,
      uploadedBy: query.uploadedBy,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
    });
  }

  async findOne(attachmentId: number) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }

    return attachment;
  }

  async remove(taskId: number, attachmentId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }
    this.logger.log('Attachment delete started', AttachmentService.name, {
      taskId,
      attachmentId,
      storageKey: attachment.storageKey,
    });

    await this.storageService.delete(attachment.storageKey);

    await this.attachmentRepository.delete(attachmentId);
    this.logger.log('Attachment deleted successfully', AttachmentService.name, {
      taskId,
      attachmentId,
      storageKey: attachment.storageKey,
    });
    return {
      message: 'Attachment deleted successfully.',
    };
  }

  async download(taskId: number, attachmentId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }

    const url = await this.storageService.getSignedUrl(attachment.storageKey);
    this.logger.log('Attachment download requested', AttachmentService.name, {
      taskId,
      attachmentId,
      storageKey: attachment.storageKey,
    });

    return {
      fileName: attachment.originalName,
      url,
    };
  }

  async rename(taskId: number, attachmentId: number, originalName: string) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }
    this.logger.log('Attachment renamed successfully', AttachmentService.name, {
      taskId,
      attachmentId,
      originalName,
    });
    return this.attachmentRepository.rename(attachmentId, originalName);
  }

  async getStatistics(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }
    this.logger.log('Attachment statistics fetched', AttachmentService.name, {
      taskId,
    });
    return this.attachmentRepository.getStatistics(taskId);
  }
}
