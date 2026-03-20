import { PrismaService } from '../prisma/prisma.service';
import { N8nService } from '../integrations/n8n/n8n.service';
import { ConfigService } from '@nestjs/config';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
export declare class ChatbotsService {
    private readonly prisma;
    private readonly n8n;
    private readonly config;
    constructor(prisma: PrismaService, n8n: N8nService, config: ConfigService);
    create(dto: CreateChatbotDto): Promise<{
        nome: string;
        active: boolean;
        id: string;
        promptCliente: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        nome: string;
        active: boolean;
        id: string;
        promptCliente: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: string, dto: UpdateChatbotDto): Promise<{
        nome: string;
        active: boolean;
        id: string;
        promptCliente: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setStatus(id: string, active: boolean): Promise<{
        nome: string;
        active: boolean;
        id: string;
        promptCliente: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
