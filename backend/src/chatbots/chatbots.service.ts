import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { N8nService } from '../integrations/n8n/n8n.service';
import { ConfigService } from '@nestjs/config';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';

@Injectable()
export class ChatbotsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly n8n: N8nService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateChatbotDto) {
    const chatbot = await this.prisma.chatbot.create({
      data: {
        nome: dto.nome,
        promptCliente: dto.prompt_cliente,
        active: dto.active ?? true,
      },
    });

    const payload = {
      chatbotId: chatbot.id,
      nome: chatbot.nome,
      prompt_cliente: chatbot.promptCliente,
      active: chatbot.active,
    };

    // Falha no webhook deve impedir o fluxo de ingestão no MVP.
    await this.n8n.createOrInstantiateChatbot(payload);
    return chatbot;
  }

  async findAll() {
    return this.prisma.chatbot.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateChatbotDto) {
    const chatbot = await this.prisma.chatbot.findUnique({
      where: { id },
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found');

    const updated = await this.prisma.chatbot.update({
      where: { id },
      data: {
        nome: dto.nome ?? chatbot.nome,
        promptCliente: dto.prompt_cliente ?? chatbot.promptCliente,
        active: dto.active ?? chatbot.active,
      },
    });
    return updated;
  }

  async setStatus(id: string, active: boolean) {
    const chatbot = await this.prisma.chatbot.findUnique({
      where: { id },
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found');

    const updated = await this.prisma.chatbot.update({
      where: { id },
      data: { active },
    });

    const payload = {
      chatbotId: updated.id,
      active: updated.active,
    };
    await this.n8n.updateChatbotStatus(payload);

    return updated;
  }
}

