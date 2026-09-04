import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthResponse, LoginDto, RegisterDto } from './dto/auth.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with that email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // A candidate is only useful with a profile + preference attached, so the
    // whole shell is created up front rather than lazily on first profile edit.
    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash,
        avatarUrl: buildAvatarUrl(dto.name),
        profile: {
          create: {
            headline: dto.headline ?? null,
            preference: { create: {} },
          },
        },
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Same error for "no such user" and "wrong password" so the endpoint does
    // not become an account-enumeration oracle.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async getById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }
    return user;
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  }): AuthResponse {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}

/**
 * Deterministic placeholder avatar. Keeps the UI populated without object
 * storage, which this clone deliberately does not have.
 */
export function buildAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name.trim() || 'candidate');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
}
