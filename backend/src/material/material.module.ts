import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [MaterialController],
  providers: [MaterialService, PrismaService],
  exports: [MaterialService],
})
export class MaterialModule {}
