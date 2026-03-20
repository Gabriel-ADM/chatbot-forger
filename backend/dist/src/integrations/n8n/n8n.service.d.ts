import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class N8nService {
    private readonly config;
    private readonly http;
    private readonly baseUrl;
    constructor(config: ConfigService, http: HttpService);
    createOrInstantiateChatbot(payload: Record<string, unknown>): Promise<void>;
    upsertDocument(payload: Record<string, unknown>): Promise<void>;
    updateChatbotStatus(payload: Record<string, unknown>): Promise<void>;
    private postJson;
}
