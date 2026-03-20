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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const n8n_service_1 = require("../integrations/n8n/n8n.service");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = __importDefault(require("crypto"));
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx']);
function normalizeStoragePath(storagePath) {
    return storagePath.split('\\').join('/');
}
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
function extractFilenameFromContentDisposition(contentDisposition) {
    if (!contentDisposition)
        return null;
    const filenameStarMatch = contentDisposition.match(/filename\\*=UTF-8''([^;]+)/i);
    if (filenameStarMatch?.[1])
        return filenameStarMatch[1].trim();
    const filenameMatch = contentDisposition.match(/filename="?([^\";]+)"?/i);
    if (filenameMatch?.[1])
        return filenameMatch[1].trim();
    return null;
}
function encodeStoragePathForUrl(storagePath) {
    const parts = storagePath.split('/').filter(Boolean);
    return parts.map((p) => encodeURIComponent(p)).join('/');
}
let DocumentsService = class DocumentsService {
    prisma;
    n8n;
    config;
    http;
    uploadsRoot;
    constructor(prisma, n8n, config, http) {
        this.prisma = prisma;
        this.n8n = n8n;
        this.config = config;
        this.http = http;
        this.uploadsRoot = (0, path_1.join)(__dirname, '..', '..', 'uploads');
    }
    async listByChatbot(chatbotId) {
        return this.prisma.document.findMany({
            where: { chatbotId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async softDelete(chatbotId, docId) {
        const doc = await this.prisma.document.findFirst({
            where: { id: docId, chatbotId },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return this.prisma.document.update({
            where: { id: docId },
            data: { status: 'PENDING_DELETE' },
        });
    }
    getBaseUrl() {
        const baseUrl = this.config.get('BASE_URL');
        if (!baseUrl) {
            throw new common_1.BadRequestException('Missing BASE_URL env var (required to build document publicUrl)');
        }
        return baseUrl.replace(/\/+$/, '');
    }
    buildPublicUrl(storagePath) {
        const baseUrl = this.getBaseUrl();
        return `${baseUrl}/files/${encodeStoragePathForUrl(storagePath)}`;
    }
    ensureAllowed(mimeType, originalName) {
        const ext = (0, path_1.extname)(originalName).toLowerCase();
        if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(ext)) {
            throw new common_1.BadRequestException('Tipo de arquivo inválido. Envie PDF, DOCX ou PPTX.');
        }
    }
    async saveBufferToDisk(chatbotId, buffer, ext) {
        const safeExt = ALLOWED_EXTENSIONS.has(ext.toLowerCase()) ? ext : '.pdf';
        const prefix = crypto_1.default.randomBytes(8).toString('hex');
        const fileName = `${prefix}${safeExt}`;
        const storagePathRaw = (0, path_1.join)(chatbotId, fileName);
        const storagePath = normalizeStoragePath(storagePathRaw);
        const fullPath = (0, path_1.join)(this.uploadsRoot, storagePath);
        await fs_1.promises.mkdir((0, path_1.dirname)(fullPath), { recursive: true });
        await fs_1.promises.writeFile(fullPath, buffer);
        return { storagePath, fullPath, fileName };
    }
    async createFromUpload(chatbotId, file) {
        if (!file?.buffer)
            throw new common_1.BadRequestException('Missing uploaded file');
        const ext = (0, path_1.extname)(file.originalname).toLowerCase();
        const mimeType = file.mimetype;
        this.ensureAllowed(mimeType, file.originalname);
        const buffer = file.buffer;
        const { storagePath } = await this.saveBufferToDisk(chatbotId, buffer, ext);
        const publicUrl = this.buildPublicUrl(storagePath);
        const doc = await this.prisma.document.create({
            data: {
                chatbotId,
                originalName: sanitizeFilename(file.originalname),
                mimeType,
                size: buffer.byteLength,
                storagePath,
                publicUrl,
                status: 'ACTIVE',
                sourceType: 'UPLOAD',
                sourceUrl: null,
            },
        });
        const payload = {
            chatbotId,
            documentId: doc.id,
            publicUrl: doc.publicUrl,
            storagePath: doc.storagePath,
            originalName: doc.originalName,
            mimeType: doc.mimeType,
            size: doc.size,
        };
        await this.n8n.upsertDocument(payload);
        return doc;
    }
    async createFromUrl(chatbotId, dto) {
        const url = dto.url;
        let res;
        try {
            res = (await (0, rxjs_1.firstValueFrom)(this.http.get(url, {
                responseType: 'arraybuffer',
                maxRedirects: 5,
                validateStatus: (s) => s >= 200 && s < 300,
            })));
        }
        catch (err) {
            throw new common_1.BadRequestException(`Falha ao baixar arquivo da URL: ${err?.message ?? 'unknown'}`);
        }
        const headers = res.headers ?? {};
        const mimeType = String(headers['content-type'] ?? '').split(';')[0].trim();
        let originalName = extractFilenameFromContentDisposition(headers['content-disposition']) ??
            (0, path_1.basename)(new URL(url).pathname) ??
            `document${mimeType === 'application/pdf' ? '.pdf' : ''}`;
        if (!originalName) {
            originalName = `document${mimeType === 'application/pdf' ? '.pdf' : ''}`;
        }
        originalName = sanitizeFilename(originalName);
        const ext = (0, path_1.extname)(originalName).toLowerCase();
        const mimeToExt = {
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        };
        const forcedExt = mimeToExt[mimeType];
        if ((!ext || !ALLOWED_EXTENSIONS.has(ext)) && forcedExt) {
            originalName = `${originalName.replace((0, path_1.extname)(originalName), '')}${forcedExt}`;
        }
        this.ensureAllowed(mimeType, originalName);
        const buffer = Buffer.from(res.data);
        const { storagePath } = await this.saveBufferToDisk(chatbotId, buffer, (0, path_1.extname)(originalName));
        const publicUrl = this.buildPublicUrl(storagePath);
        const doc = await this.prisma.document.create({
            data: {
                chatbotId,
                originalName,
                mimeType,
                size: buffer.byteLength,
                storagePath,
                publicUrl,
                status: 'ACTIVE',
                sourceType: 'URL',
                sourceUrl: url,
            },
        });
        const payload = {
            chatbotId,
            documentId: doc.id,
            publicUrl: doc.publicUrl,
            storagePath: doc.storagePath,
            originalName: doc.originalName,
            mimeType: doc.mimeType,
            size: doc.size,
        };
        await this.n8n.upsertDocument(payload);
        return doc;
    }
    async createFromUrlForSwagger(chatbotId, dto) {
        return this.createFromUrl(chatbotId, dto);
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        n8n_service_1.N8nService,
        config_1.ConfigService,
        axios_1.HttpService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map