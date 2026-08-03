import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  user!: unknown;

  @ApiProperty({
    type: TokenResponseDto,
  })
  tokens!: TokenResponseDto;
}

export class ProfileResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;
}
