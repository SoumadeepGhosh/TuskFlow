import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';

export class ProjectMemberUserResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'Soumadeep Ghosh',
  })
  name!: string;

  @ApiProperty({
    example: 'soumadeep@gmail.com',
  })
  email!: string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  avatarUrl!: string | null;
}

export class ProjectMemberResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  projectId!: number;

  @ApiProperty({
    example: 2,
  })
  userId!: number;

  @ApiProperty({
    enum: ProjectRole,
    example: ProjectRole.DEVELOPER,
  })
  role!: ProjectRole;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
    nullable: true,
  })
  joinedAt!: Date | null;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: () => ProjectMemberUserResponseDto,
  })
  user!: ProjectMemberUserResponseDto;
}

export class ProjectMemberMessageResponseDto {
  @ApiProperty({
    example: 'Project member removed successfully',
  })
  message!: string;
}
