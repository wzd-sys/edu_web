import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../common/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async create(dto: CreateMaterialDto, fileUrl: string, uploaderId: number, modelUrl?: string, coverUrl?: string) {
    return this.prisma.material.create({
      data: {
        title: dto.title,
        subject: dto.subject,
        grade: dto.grade,
        type: dto.type,
        description: dto.description,
        fileUrl,
        coverUrl,
        modelUrl,
        uploaderId,
      },
      include: { uploader: { select: { id: true, username: true } } },
    });
  }

  async findAll(query: QueryMaterialDto) {
    const { page = 1, pageSize = 10, subject, grade, type, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (subject) where.subject = subject;
    if (grade) where.grade = grade;
    if (type) where.type = type;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { uploader: { select: { id: true, username: true } } },
      }),
      this.prisma.material.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { uploader: { select: { id: true, username: true } } },
    });
    if (!material) throw new NotFoundException('教材不存在');
    return material;
  }

  async remove(id: number, userId: number) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('教材不存在');
    if (material.uploaderId !== userId) throw new NotFoundException('无权删除');

    await this.prisma.like.deleteMany({ where: { materialId: id } });
    await this.prisma.userMaterial.deleteMany({ where: { materialId: id } });
    await this.prisma.material.delete({ where: { id } });
  }

  getFilePath(fileUrl: string): string {
    const uploadDir = this.config.get('UPLOAD_DIR', './uploads');
    return path.join(uploadDir, path.basename(fileUrl));
  }
}
