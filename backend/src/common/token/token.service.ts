import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload) {
    const expiresIn = this.configService.get<StringValue>(
      'jwt.accessTokenExpiresIn',
    )!;

    return this.jwtService.sign(payload, {
      expiresIn,
    });
  }

  generateRefreshToken(payload: { sub: number; email: string }) {
    const expiresIn = this.configService.get<StringValue>(
      'jwt.refreshTokenExpiresIn',
    )!;

    return this.jwtService.sign(payload, {
      expiresIn,
    });
  }

  verifyToken(token: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.jwtService.verify(token);
  }
}
