import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StoredFile {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private uploadDir: string;

  constructor() {
    const backendUploads = path.resolve(process.cwd(), 'backend', 'uploads');
    const rootUploads = path.resolve(process.cwd(), 'uploads');

    if (fs.existsSync(backendUploads)) {
      this.uploadDir = backendUploads;
    } else {
      this.uploadDir = rootUploads;
    }

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  getFilePath(storageKey: string): string | null {
    if (!storageKey) return null;

    // Prevent directory traversal attacks
    const sanitizedKey = storageKey
      .replace(/^(\.\.(\/|\\|$))+/, '')
      .replace(/[/\\]\.\.[/\\]/g, '/')
      .replace(/^[/\\]+/, '');

    // 1. Check primary uploadDir
    const primaryPath = path.resolve(this.uploadDir, sanitizedKey);
    if (fs.existsSync(primaryPath)) {
      return primaryPath;
    }

    // 2. Check alternate directories (backend/uploads vs uploads)
    const candidates = [
      path.resolve(process.cwd(), 'uploads', sanitizedKey),
      path.resolve(process.cwd(), 'backend', 'uploads', sanitizedKey),
      path.resolve(__dirname, '..', '..', '..', 'uploads', sanitizedKey),
      path.resolve(__dirname, '..', '..', '..', 'backend', 'uploads', sanitizedKey),
    ];

    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        return cand;
      }
    }

    return null;
  }

  async saveFile(
    file: Express.Multer.File,
    subfolder = 'attachments',
  ): Promise<StoredFile> {
    const targetDir = path.join(this.uploadDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Sanitize extension and original name
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = rawExt.replace(/[^a-z0-9.]/g, '') || '.bin';
    const originalName = path.basename(file.originalname).replace(/[\0\r\n]/g, '');

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${uniqueSuffix}${ext}`;
    const filePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const storageKey = `${subfolder}/${fileName}`;
    const fileUrl = `/uploads/${storageKey}`;

    return {
      fileName,
      originalName,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype || 'application/octet-stream',
      storageKey,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(storageKey);
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${storageKey}`, error);
      return false;
    }
  }

  getFileUrl(storageKey: string): string {
    return `/uploads/${storageKey}`;
  }
}
