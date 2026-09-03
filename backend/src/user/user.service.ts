import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMaterials(userId: number, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.userMaterial.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          material: { include: { uploader: { select: { id: true, username: true } } } },
        },
      }),
      this.prisma.userMaterial.count({ where: { userId } }),
    ]);

    return {
      items: items.map((um) => um.material),
      total,
      page,
      pageSize,
    };
  }

  async getStatus(userId: number, materialId: number) {
    const record = await this.prisma.userMaterial.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });
    return { collected: !!record };
  }

  async addMaterial(userId: number, materialId: number) {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new NotFoundException('教材不存在');

    const existing = await this.prisma.userMaterial.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });
    if (existing) throw new ConflictException('已在个人空间中');

    return this.prisma.userMaterial.create({
      data: { userId, materialId },
    });
  }

  async removeMaterial(userId: number, materialId: number) {
    const record = await this.prisma.userMaterial.findUnique({
      where: { userId_materialId: { userId, materialId } },
    });
    if (!record) throw new NotFoundException('不在个人空间中');

    await this.prisma.userMaterial.delete({
      where: { userId_materialId: { userId, materialId } },
    });
  }
}
