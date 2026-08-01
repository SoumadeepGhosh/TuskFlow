import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordService } from '../../common/password/password.service';
import { LoginDto } from './dto/login.dto';
import { TokenService } from 'src/common/token/token.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.authRepository.findUserByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(registerDto.password);

    // Create user
    const user = await this.authRepository.createUser({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
    });

    // Remove password hash before sending response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);

    const refreshToken = this.tokenService.generateRefreshToken(payload);
    const refreshTokenHash = await this.passwordService.hash(refreshToken);
    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.authRepository.updateLastLogin(user.id);
    const { passwordHash, ...safeUser } = user;

    return {
      user: safeUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  getProfile(user: JwtPayload) {
    return user;
  }
}
