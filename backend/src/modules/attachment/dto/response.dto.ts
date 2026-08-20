import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 12,
  })
  taskId!: number;

  @ApiProperty({
    example: 3,
  })
  uploadedBy!: number;

  @ApiProperty({
    example: 'project-design.pdf',
  })
  originalName!: string;

  @ApiProperty({
    example: 'b5a2b72d-a9f6-4f8b-8d9b-project-design.pdf',
  })
  fileName!: string;

  @ApiProperty({
    example: 'attachments/b5a2b72d-a9f6-4f8b-8d9b-project-design.pdf',
  })
  storageKey!: string;

  @ApiProperty({
    example:
      'https://pub-xxxxxxxx.r2.dev/attachments/b5a2b72d-a9f6-4f8b-8d9b-project-design.pdf',
  })
  fileUrl!: string;

  @ApiProperty({
    nullable: true,
    example: null,
  })
  thumbnailUrl!: string | null;

  @ApiProperty({
    example: 'application/pdf',
  })
  mimeType!: string;

  @ApiProperty({
    example: 'pdf',
  })
  fileExtension!: string;

  @ApiProperty({
    example: 254872,
  })
  fileSize!: number;

  @ApiProperty({
    example: false,
  })
  isImage!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
