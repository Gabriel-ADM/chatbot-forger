"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const n8n_service_1 = require("../integrations/n8n/n8n.service");
const config_1 = require("@nestjs/config");
let ChatbotsService = class ChatbotsService {
    prisma;
    n8n;
    config;
    constructor(prisma, n8n, config) {
        this.prisma = prisma;
        this.n8n = n8n;
        this.config = config;
    }
    async create(dto) {
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
        await this.n8n.createOrInstantiateChatbot(payload);
        return chatbot;
    }
    async findAll() {
        return this.prisma.chatbot.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, dto) {
        const chatbot = await this.prisma.chatbot.findUnique({
            where: { id },
        });
        if (!chatbot)
            throw new common_1.NotFoundException('Chatbot not found');
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
    async setStatus(id, active) {
        const chatbot = await this.prisma.chatbot.findUnique({
            where: { id },
        });
        if (!chatbot)
            throw new common_1.NotFoundException('Chatbot not found');
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
};
exports.ChatbotsService = ChatbotsService;
exports.ChatbotsService = ChatbotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        n8n_service_1.N8nService,
        config_1.ConfigService])
], ChatbotsService);
//# sourceMappingURL=chatbots.service.js.map