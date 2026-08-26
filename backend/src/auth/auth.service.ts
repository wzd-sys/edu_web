import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          passwordHash,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('用户名或邮箱已存在');
      }
      throw error;
    }

    return {
      token: this.jwt.sign({ sub: user.id, username: user.username }),
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: dto.account }, { email: dto.account }] },
    });
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return {
      token: this.jwt.sign({ sub: user.id, username: user.username }),
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }
}
