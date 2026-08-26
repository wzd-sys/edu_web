import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private config: ConfigService) {}

  async *chatStream(message: string): AsyncGenerator<string> {
    const apiKey = this.config.get('DASHSCOPE_API_KEY', '');
    const model = this.config.get('AI_MODEL', 'qwen-turbo');
    const baseUrl = this.config.get('AI_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1');

    if (!apiKey || apiKey === 'sk-placeholder') {
      yield 'AI 服务未配置。请在环境变量中设置 DASHSCOPE_API_KEY。';
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一个教育助手，帮助小学教师解答教材相关问题。请用简洁易懂的方式回答。' },
            { role: 'user', content: message },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        this.logger.error(`AI API error: ${response.status} ${response.statusText}`);
        yield `AI 服务请求失败（${response.status}），请稍后重试。`;
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield 'AI 服务响应异常';
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    } catch (error) {
      this.logger.error(`AI stream error: ${error}`);
      yield 'AI 服务连接失败，请检查网络或稍后重试。';
    }
  }
}
