import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkspaceRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({
    example: 'colleague@example.com',
    description: 'Email address of the user to invite',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
    default: WorkspaceRole.MEMBER,
    description: 'Workspace role to assign upon accepting invitation',
  })
  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}

