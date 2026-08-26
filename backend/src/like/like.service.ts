import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: number, materialId: number) {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new NotFoundException('教材不存在');

    const existing = await this.prisma.like.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });

    if (existing) {
      await this.prisma.like.delete({
        where: { userId_materialId: { userId, materialId } },
      });
      await this.prisma.material.update({
        where: { id: materialId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false, likeCount: Math.max(0, material.likeCount - 1) };
    }

    await this.prisma.like.create({ data: { userId, materialId } });
    await this.prisma.material.update({
      where: { id: materialId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true, likeCount: material.likeCount + 1 };
  }

  async getStatus(userId: number, materialId: number) {
    const like = await this.prisma.like.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    return { liked: !!like, likeCount: material?.likeCount ?? 0 };
  }
}
