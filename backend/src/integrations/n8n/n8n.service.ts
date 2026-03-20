import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class N8nService {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = this.config.get<string>('N8N_BASE_URL') ?? '';
  }

  async createOrInstantiateChatbot(payload: Record<string, unknown>) {
    const url = this.config.get<string>('N8N_WEBHOOK_CREATE_CHATBOT');
    if (!url) throw new HttpException('Missing N8N webhook URL', 500);
    await this.postJson(url, payload);
  }

  async upsertDocument(payload: Record<string, unknown>) {
    const url = this.config.get<string>('N8N_WEBHOOK_DOCUMENT_UPSERT');
    if (!url) throw new HttpException('Missing N8N webhook URL', 500);
    await this.postJson(url, payload);
  }

  async updateChatbotStatus(payload: Record<string, unknown>) {
    const url = this.config.get<string>('N8N_WEBHOOK_STATUS');
    if (!url) throw new HttpException('Missing N8N webhook URL', 500);
    await this.postJson(url, payload);
  }

  private async postJson(url: string, payload: Record<string, unknown>) {
    try {
      const res = await firstValueFrom(
        this.http.post(url, payload, {
          headers: { 'content-type': 'application/json' },
          // MVP: sem timeout custom; pode ser refinado depois
        }),
      );
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Failed calling n8n webhook';
      throw new HttpException(
        { message, details: err?.response?.data },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}

