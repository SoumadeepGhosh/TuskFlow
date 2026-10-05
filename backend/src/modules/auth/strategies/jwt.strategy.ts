import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

const customJwtExtractor = (req: Request): string | null => {
  if (!req || !req.headers) return null;
  const rawAuth =
    req.headers.authorization ||
    (req.headers as Record<string, unknown>)['Authorization'];
  if (!rawAuth || typeof rawAuth !== 'string') return null;

  let token = rawAuth.trim();
  while (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim();
  }
  return token.length > 0 ? token : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: customJwtExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
