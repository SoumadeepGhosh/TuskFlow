import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { MemberStatus, ProjectRole } from '@prisma/client';
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

  private async assertCanAccessProject(
    project: {
      id: number;
      workspaceId: number;
      createdBy: number;
      workspace?: { id: number; name: string; ownerId: number } | null;
      members?: Array<{ userId: number; role: ProjectRole }>;
    },
    userId: number,
  ) {
    // 1. Workspace owner has access
    if (project.workspace?.ownerId === userId) {
      return true;
    }

    // 2. Project creator has access
    if (project.createdBy === userId) {
      return true;
    }

    // 3. Project member has access
    if (project.members?.some((m) => m.userId === userId)) {
      return true;
    }

    // 4. Workspace active member has access
    const wsMember = await this.attachmentRepository.findWorkspaceMember(
      project.workspaceId,
      userId,
    );
    if (wsMember && wsMember.status === MemberStatus.ACTIVE) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access attachments for this project',
    );
  }

  async upload(
    file: Express.Multer.File,
    dto: UploadAttachmentDto,
    user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const task = await this.attachmentRepository.findTaskWithProject(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.assertCanAccessProject(task.project, user.sub);

    const saved = await this.storageService.saveFile(file, 'attachments');

    const created = await this.attachmentRepository.createAttachment({
      taskId: dto.taskId,
      uploadedBy: user.sub,
      fileName: saved.originalName,
      fileUrl: saved.fileUrl,
      mimeType: saved.mimeType,
      fileSize: saved.fileSize,
    });

    return {
      ...created,
      uploader: {
        id: user.sub,
        email: user.email,
      },
    };
  }

  async findAll(query: AttachmentQueryDto, user?: JwtPayload) {
    const task = await this.attachmentRepository.findTaskWithProject(query.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (user) {
      await this.assertCanAccessProject(task.project, user.sub);
    }

    const attachments = await this.attachmentRepository.findAttachments(
      query.taskId,
      query.page,
      query.limit,
    );

    const total = await this.attachmentRepository.countAttachments(
      query.taskId,
    );

    // Batch enrich with uploader details
    const userIds = [...new Set(attachments.map((a) => a.uploadedBy))];
    const users = await this.attachmentRepository.findUsersByIds(userIds);
    const userMap = new Map<number, { id: number; name: string | null; email: string }>();
    users.forEach((u: { id: number; name: string | null; email: string }) => userMap.set(u.id, u));

    const items = attachments.map((att) => ({
      ...att,
      uploader: userMap.get(att.uploadedBy) || null,
    }));

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getFileStream(id: number, user: JwtPayload) {
    const attachment = await this.attachmentRepository.findAttachmentWithDetails(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (!attachment.task || attachment.task.deletedAt) {
      throw new NotFoundException('Associated task not found or has been deleted');
    }

    await this.assertCanAccessProject(attachment.task.project, user.sub);

    // Extract storage key from fileUrl e.g. "/uploads/attachments/123.pdf" -> "attachments/123.pdf"
    const storageKey = attachment.fileUrl.replace(/^\/?(api\/)?uploads\//, '');
    const filePath = this.storageService.getFilePath(storageKey);

    if (!filePath || !fs.existsSync(filePath)) {
      throw new NotFoundException('File physically missing from server storage');
    }

    const stat = await fs.promises.stat(filePath);
    const stream = fs.createReadStream(filePath);

    return {
      stream,
      attachment,
      fileSize: stat.size,
      filePath,
    };
  }

  async remove(id: number, user: JwtPayload) {
    const attachment = await this.attachmentRepository.findAttachmentWithDetails(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const isUploader = attachment.uploadedBy === user.sub;
    const isOwner = attachment.task?.project?.workspace?.ownerId === user.sub;
    const isCreator = attachment.task?.project?.createdBy === user.sub;
    const projectMember = attachment.task?.project?.members?.find((m) => m.userId === user.sub);
    const isProjectManager =
      projectMember?.role === ProjectRole.OWNER ||
      projectMember?.role === ProjectRole.MANAGER;

    if (!isUploader && !isOwner && !isCreator && !isProjectManager) {
      throw new ForbiddenException(
        'You are not allowed to delete this attachment',
      );
    }

    // Try deleting from storage using fileUrl
    const storageKey = attachment.fileUrl.replace(/^\/?(api\/)?uploads\//, '');
    await this.storageService.deleteFile(storageKey);

    await this.attachmentRepository.deleteAttachment(id);

    return {
      message: 'Attachment deleted successfully',
    };
  }
}
