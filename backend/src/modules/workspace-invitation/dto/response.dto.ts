import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus, WorkspaceRole } from '@prisma/client';

export class InviterDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  avatarUrl!: string | null;
}

export class WorkspaceSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Acme Corp' })
  name!: string;

  @ApiProperty({ example: 'acme-corp' })
  slug!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  logoUrl!: string | null;
}

export class WorkspaceInvitationResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  workspaceId!: number;

  @ApiProperty({ example: 'colleague@example.com' })
  email!: string;

  @ApiProperty({ enum: WorkspaceRole, example: WorkspaceRole.MEMBER })
  role!: WorkspaceRole;

  @ApiProperty({ enum: InvitationStatus, example: InvitationStatus.PENDING })
  status!: InvitationStatus;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  expiresAt!: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  acceptedAt!: Date | null;

  @ApiProperty({ example: '2026-10-08T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: () => InviterDto })
  inviter!: InviterDto;

  @ApiPropertyOptional({ type: () => WorkspaceSummaryDto })
  workspace?: WorkspaceSummaryDto;
}

