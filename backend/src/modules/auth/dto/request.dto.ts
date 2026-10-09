import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Soumadeep Ghosh',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'soumadeep@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password@123',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'soumadeep@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password@123',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class UpdateProfileDto {
  @ApiProperty({
    required: false,
    example: 'John Doe',
  })
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    required: false,
    example: '/uploads/avatars/user.png',
  })
  @IsString()
  avatarUrl?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword@123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPassword@123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword!: string;
}

