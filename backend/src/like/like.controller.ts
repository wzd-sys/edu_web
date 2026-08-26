import { Controller, Post, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('点赞')
@Controller('likes')
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post(':materialId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞/取消点赞' })
  toggle(
    @CurrentUser() user: { id: number },
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.likeService.toggle(user.id, materialId);
  }

  @Get(':materialId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取点赞状态' })
  getStatus(
    @CurrentUser() user: { id: number },
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.likeService.getStatus(user.id, materialId);
  }
}
