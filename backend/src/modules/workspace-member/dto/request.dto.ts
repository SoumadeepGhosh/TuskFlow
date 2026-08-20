/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus, WorkspaceRole } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    example: 'john@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
  })
  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: WorkspaceRole,
    example: WorkspaceRole.ADMIN,
  })
  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}

export class UpdateMemberStatusDto {
  @ApiProperty({
    enum: MemberStatus,
    example: MemberStatus.ACTIVE,
  })
  @IsEnum(MemberStatus)
  status!: MemberStatus;
}
