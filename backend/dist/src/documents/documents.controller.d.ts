import { DocumentsService } from './documents.service';
import { CreateDocumentFromUrlDto } from './dto/from-url.dto';
export declare class DocumentsController {
    private readonly documents;
    constructor(documents: DocumentsService);
    upload(chatbotId: string, file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatbotId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        originalName: string;
        mimeType: string;
        size: number;
        storagePath: string;
        publicUrl: string;
        sourceType: import("@prisma/client").$Enums.DocumentSourceType;
        sourceUrl: string | null;
    }>;
    createFromUrl(chatbotId: string, dto: CreateDocumentFromUrlDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatbotId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        originalName: string;
        mimeType: string;
        size: number;
        storagePath: string;
        publicUrl: string;
        sourceType: import("@prisma/client").$Enums.DocumentSourceType;
        sourceUrl: string | null;
    }>;
    findByChatbot(chatbotId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatbotId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        originalName: string;
        mimeType: string;
        size: number;
        storagePath: string;
        publicUrl: string;
        sourceType: import("@prisma/client").$Enums.DocumentSourceType;
        sourceUrl: string | null;
    }[]>;
    softDelete(chatbotId: string, docId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatbotId: string;
        status: import("@prisma/client").$Enums.DocumentStatus;
        originalName: string;
        mimeType: string;
        size: number;
        storagePath: string;
        publicUrl: string;
        sourceType: import("@prisma/client").$Enums.DocumentSourceType;
        sourceUrl: string | null;
    }>;
}
