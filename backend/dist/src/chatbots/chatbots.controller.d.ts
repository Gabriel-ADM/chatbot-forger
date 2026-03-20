import { ChatbotsService } from './chatbots.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { SetChatbotStatusDto } from './dto/status-chatbot.dto';
export declare class ChatbotsController {
    private readonly chatbots;
    constructor(chatbots: ChatbotsService);
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
    setStatus(id: string, dto: SetChatbotStatusDto): Promise<{
        nome: string;
        active: boolean;
        id: string;
        promptCliente: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
