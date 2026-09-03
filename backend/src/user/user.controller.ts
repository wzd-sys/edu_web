import { Controller, Get, Post, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('个人空间')
@Controller('user/materials')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '个人空间教材列表' })
  getMaterials(
    @CurrentUser() user: { id: number },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.userService.getMaterials(user.id, Number(page) || 1, Number(pageSize) || 10);
  }

  @Get(':materialId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询收藏状态' })
  getStatus(
    @CurrentUser() user: { id: number },
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.userService.getStatus(user.id, materialId);
  }

  @Post(':materialId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏教材' })
  addMaterial(
    @CurrentUser() user: { id: number },
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.userService.addMaterial(user.id, materialId);
  }

  @Delete(':materialId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消收藏' })
  removeMaterial(
    @CurrentUser() user: { id: number },
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.userService.removeMaterial(user.id, materialId);
  }
}
