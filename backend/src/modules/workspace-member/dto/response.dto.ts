/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus, WorkspaceRole } from '@prisma/client';

export class WorkspaceMemberUserResponseDto {
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

export class WorkspaceMemberResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  workspaceId!: number;

  @ApiProperty({
    example: 1,
  })
  userId!: number;

  @ApiProperty({
    enum: WorkspaceRole,
  })
  role!: WorkspaceRole;

  @ApiProperty({
    enum: MemberStatus,
  })
  status!: MemberStatus;

  @ApiProperty()
  joinedAt!: Date;

  @ApiProperty({
    type: WorkspaceMemberUserResponseDto,
  })
  user!: WorkspaceMemberUserResponseDto;
}

export class WorkspaceMemberListResponseDto {
  @ApiProperty({
    type: [WorkspaceMemberResponseDto],
  })
  items!: WorkspaceMemberResponseDto[];

  @ApiProperty({
    example: 25,
  })
  total!: number;

  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;
}
