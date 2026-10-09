import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ChangePasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/request.dto';
import { AuthRepository } from './repositories/auth.repository';
import { PasswordService } from '../../common/password/password.service';
import { TokenService } from 'src/common/token/token.service';
import { StorageService } from '../../common/storage/storage.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly storageService: StorageService,
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
      accessToken,
      refreshToken,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async getProfile(user: JwtPayload) {
    const existingUser = await this.authRepository.findUserById(user.sub);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash: _, ...safeUser } = existingUser;
    return safeUser;
  }
  async refresh(refreshTokenDto: RefreshTokenDto) {
    // 1. Verify refresh token
    const payload = this.tokenService.verifyRefreshToken(
      refreshTokenDto.refreshToken,
    );

    // 2. Find all active refresh tokens for user
    const refreshTokens = await this.authRepository.findRefreshTokensByUserId(
      payload.sub,
    );

    // 3. Find matching refresh token
    let matchedToken: (typeof refreshTokens)[number] | null = null;

    for (const token of refreshTokens) {
      const isMatch = await this.passwordService.compare(
        refreshTokenDto.refreshToken,
        token.tokenHash,
      );

      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 4. Delete old refresh token
    await this.authRepository.deleteRefreshToken(matchedToken.id);

    // 5. Generate new tokens
    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
    };

    const accessToken = this.tokenService.generateAccessToken(newPayload);

    const refreshToken = this.tokenService.generateRefreshToken(newPayload);

    // 6. Hash new refresh token
    const refreshTokenHash = await this.passwordService.hash(refreshToken);

    // 7. Save new refresh token
    await this.authRepository.createRefreshToken({
      userId: payload.sub,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 8. Return new tokens
    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(logoutDto: LogoutDto) {
    const payload = this.tokenService.verifyRefreshToken(
      logoutDto.refreshToken,
    );

    const refreshTokens = await this.authRepository.findRefreshTokensByUserId(
      payload.sub,
    );

    let matchedToken: (typeof refreshTokens)[number] | null = null;

    for (const token of refreshTokens) {
      const isMatch = await this.passwordService.compare(
        logoutDto.refreshToken,
        token.tokenHash,
      );

      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepository.deleteRefreshToken(matchedToken.id);

    return {
      message: 'Logged out successfully',
    };
  }
  async logoutAll(user: JwtPayload) {
    await this.authRepository.deleteAllRefreshTokens(user.sub);

    return {
      message: 'Logged out from all devices successfully',
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.authRepository.updateUser(userId, {
      ...(dto.name && { name: dto.name }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
    });

    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, PNG, WEBP, and SVG are supported.',
      );
    }

    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if present
    if (user.avatarUrl) {
      const storageKey = user.avatarUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    const saved = await this.storageService.saveFile(file, 'avatars');
    const updated = await this.authRepository.updateUser(userId, {
      avatarUrl: saved.fileUrl,
    });

    const { passwordHash: _, ...safeUser } = updated;
    return {
      avatarUrl: saved.fileUrl,
      user: safeUser,
    };
  }

  async removeAvatar(userId: number) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarUrl) {
      const storageKey = user.avatarUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    const updated = await this.authRepository.updateUser(userId, {
      avatarUrl: null,
    });

    const { passwordHash: _, ...safeUser } = updated;
    return {
      avatarUrl: null,
      user: safeUser,
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await this.passwordService.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.authRepository.updateUser(userId, { passwordHash: newHash });

    return {
      message: 'Password changed successfully',
    };
  }
}

