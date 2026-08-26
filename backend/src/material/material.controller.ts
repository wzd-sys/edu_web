import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Res, ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { readFileSync, unlinkSync } from 'fs';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gltf', '.glb'];

const ALLOWED_MIMES: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp'],
  '.gltf': ['application/json', 'model/gltf+json', 'text/plain'],
  '.glb': ['model/gltf-binary', 'application/octet-stream'],
};

const MAGIC_BYTES: Record<string, (buf: Buffer) => boolean> = {
  '.pdf': (buf) => buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46,
  '.png': (buf) => buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47,
  '.jpg': (buf) => buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
  '.jpeg': (buf) => buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
  '.webp': (buf) => buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46,
  '.glb': (buf) => buf[0] === 0x67 && buf[1] === 0x6C && buf[2] === 0x54 && buf[3] === 0x46,
};

function validateMagicBytes(filePath: string, ext: string): boolean {
  const checker = MAGIC_BYTES[ext];
  if (!checker) return true;
  try {
    const fd = readFileSync(filePath);
    const header = fd.subarray(0, 12);
    return checker(header);
  } catch {
    return false;
  }
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    const config = new ConfigService();
    cb(null, config.get('UPLOAD_DIR', './uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: unknown, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`不支持的文件类型: ${ext}`), false);
  }
  const allowedMimes = ALLOWED_MIMES[ext];
  if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`文件MIME类型不匹配: 期望 ${allowedMimes.join('/')}, 实际 ${file.mimetype}`), false);
  }
  cb(null, true);
};

@ApiTags('教材')
@Controller('materials')
export class MaterialController {
  constructor(private materialService: MaterialService) {}

  @Get()
  @ApiOperation({ summary: '教材列表（分页、筛选、搜索）' })
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '教材详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 52428800 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传教材' })
  async create(
    @Body() dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: number },
  ) {
    const ext = extname(file.originalname).toLowerCase();
    const filePath = file.path;
    if (!validateMagicBytes(filePath, ext)) {
      try { unlinkSync(filePath); } catch { /* ignore */ }
      throw new BadRequestException(`文件内容校验失败: ${ext} 文件格式不合法`);
    }
    const fileUrl = `/uploads/${file.filename}`;
    const modelUrl = ['.gltf', '.glb'].includes(ext) ? fileUrl : undefined;
    const coverUrl = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? fileUrl : undefined;
    return this.materialService.create(dto, fileUrl, user.id, modelUrl, coverUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除教材' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.materialService.remove(id, user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载教材' })
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const material = await this.materialService.findOne(id);
    const filePath = this.materialService.getFilePath(material.fileUrl);
    res.download(filePath, material.title + extname(filePath));
  }
}
