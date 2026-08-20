import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ProjectMemberPaginationDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

export class AddProjectMemberDto {
  @ApiProperty({
    example: 'john@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: ProjectRole,
    example: ProjectRole.DEVELOPER,
  })
  @IsEnum(ProjectRole)
  role!: ProjectRole;
}

export class UpdateProjectMemberRoleDto {
  @ApiProperty({
    enum: ProjectRole,
    example: ProjectRole.MANAGER,
  })
  @IsEnum(ProjectRole)
  role!: ProjectRole;
}
