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
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    subfolder = 'attachments',
  ): Promise<StoredFile> {
    const targetDir = path.join(this.uploadDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${uniqueSuffix}${ext}`;
    const filePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const storageKey = `${subfolder}/${fileName}`;
    const fileUrl = `/uploads/${storageKey}`;

    return {
      fileName,
      originalName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      storageKey,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, storageKey);
      if (fs.existsSync(filePath)) {
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
