import { Controller, Post, Body, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI对话')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI对话（SSE流式输出）' })
  async chat(@Body('message') message: string, @Res() res: Response) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new BadRequestException('请输入问题');
    }
    if (message.length > 4000) {
      throw new BadRequestException('问题长度不能超过4000字符');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of this.aiService.chatStream(message.trim())) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}
