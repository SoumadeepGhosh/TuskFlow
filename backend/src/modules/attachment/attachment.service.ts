import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentRepository } from './repositories/attachment.repository';
import { StorageService } from '../../common/storage/storage.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AttachmentQueryDto, UploadAttachmentDto } from './dto/request.dto';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    file: Express.Multer.File,
    dto: UploadAttachmentDto,
    user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const task = await this.attachmentRepository.findTask(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const saved = await this.storageService.saveFile(file, 'attachments');

    return this.attachmentRepository.createAttachment({
      taskId: dto.taskId,
      uploadedBy: user.sub,
      fileName: saved.originalName,
      fileUrl: saved.fileUrl,
      mimeType: saved.mimeType,
      fileSize: saved.fileSize,
    });
  }

  async findAll(query: AttachmentQueryDto) {
    const task = await this.attachmentRepository.findTask(query.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const attachments = await this.attachmentRepository.findAttachments(
      query.taskId,
      query.page,
      query.limit,
    );

    const total = await this.attachmentRepository.countAttachments(
      query.taskId,
    );

    return {
      items: attachments,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async remove(id: number, user: JwtPayload) {
    const attachment = await this.attachmentRepository.findAttachmentById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.uploadedBy !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to delete this attachment',
      );
    }

    // Try deleting from storage using fileUrl
    const storageKey = attachment.fileUrl.replace('/uploads/', '');
    await this.storageService.deleteFile(storageKey);

    await this.attachmentRepository.deleteAttachment(id);

    return {
      message: 'Attachment deleted successfully',
    };
  }
}
