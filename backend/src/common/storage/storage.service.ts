/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('storage.bucketName');

    this.publicUrl = this.configService.get<string>('storage.publicUrl');

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.configService.getOrThrow<string>('storage.endpoint'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(
          'storage.accessKeyId',
        ),
        secretAccessKey: this.configService.getOrThrow<string>(
          'storage.secretAccessKey',
        ),
      },
    });
  }

  /**
   * Generates a unique storage key.
   * Example:
   * attachments/550e8400-e29b-41d4-a716-446655440000-report.pdf
   */
  private generateStorageKey(folder: string, fileName: string): string {
    return `${folder}/${crypto.randomUUID()}-${fileName}`;
  }

  /**
   * Upload file to Cloudflare R2
   */
  async upload(
    folder: string,
    fileName: string,
    body: Buffer,
    contentType: string,
  ): Promise<{
    key: string;
    url: string;
  }> {
    const key = this.generateStorageKey(folder, fileName);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: 'public,max-age=31536000,immutable',
        }),
      );
    } catch (error) {
      console.error('========== R2 ERROR ==========');
      console.error(error);
      console.error('==============================');
      throw error;
    }

    return {
      key,
      url: this.publicUrl ? `${this.publicUrl}/${key}` : key,
    };
  }

  /**
   * Check whether a file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete file
   */
  async delete(key: string): Promise<boolean> {
    const exists = await this.exists(key);

    if (!exists) {
      return false;
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return true;
  }

  getConfig() {
    return {
      bucket: this.bucket,
      endpoint: this.configService.get('storage.endpoint'),
      publicUrl: this.publicUrl,
    };
  }
  /**
   * Generate temporary signed URL
   */
  async getSignedUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      {
        expiresIn: 60 * 15,
      },
    );
  }
}
