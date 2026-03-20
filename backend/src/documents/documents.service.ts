import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { N8nService } from '../integrations/n8n/n8n.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { promises as fs } from 'fs';
import { join, dirname, extname, basename } from 'path';
import crypto from 'crypto';

import { CreateDocumentFromUrlDto } from './dto/from-url.dto';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx']);

function normalizeStoragePath(storagePath: string): string {
  return storagePath.split('\\').join('/');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function extractFilenameFromContentDisposition(
  contentDisposition: string | undefined,
): string | null {
  if (!contentDisposition) return null;
  // Examples:
  // Content-Disposition: attachment; filename="report.pdf"
  // Content-Disposition: attachment; filename*=UTF-8''report.pdf
  const filenameStarMatch = contentDisposition.match(/filename\\*=UTF-8''([^;]+)/i);
  if (filenameStarMatch?.[1]) return filenameStarMatch[1].trim();

  const filenameMatch = contentDisposition.match(/filename="?([^\";]+)"?/i);
  if (filenameMatch?.[1]) return filenameMatch[1].trim();
  return null;
}

function encodeStoragePathForUrl(storagePath: string): string {
  const parts = storagePath.split('/').filter(Boolean);
  return parts.map((p) => encodeURIComponent(p)).join('/');
}

@Injectable()
export class DocumentsService {
  private readonly uploadsRoot: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly n8n: N8nService,
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    // dist/documents -> ../../uploads (backend/uploads)
    this.uploadsRoot = join(__dirname, '..', '..', 'uploads');
  }

  async listByChatbot(chatbotId: string) {
    // Inclui status atual (ACTIVE / PENDING_DELETE)
    return this.prisma.document.findMany({
      where: { chatbotId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async softDelete(chatbotId: string, docId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: docId, chatbotId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id: docId },
      data: { status: 'PENDING_DELETE' },
    });
  }

  private getBaseUrl(): string {
    const baseUrl = this.config.get<string>('BASE_URL');
    if (!baseUrl) {
      throw new BadRequestException(
        'Missing BASE_URL env var (required to build document publicUrl)',
      );
    }
    return baseUrl.replace(/\/+$/, '');
  }

  private buildPublicUrl(storagePath: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/files/${encodeStoragePathForUrl(storagePath)}`;
  }

  private ensureAllowed(mimeType: string, originalName: string) {
    const ext = extname(originalName).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(
        'Tipo de arquivo inválido. Envie PDF, DOCX ou PPTX.',
      );
    }
  }

  private async saveBufferToDisk(chatbotId: string, buffer: Buffer, ext: string) {
    const safeExt = ALLOWED_EXTENSIONS.has(ext.toLowerCase()) ? ext : '.pdf';
    const prefix = crypto.randomBytes(8).toString('hex');
    const fileName = `${prefix}${safeExt}`;

    const storagePathRaw = join(chatbotId, fileName);
    const storagePath = normalizeStoragePath(storagePathRaw);
    const fullPath = join(this.uploadsRoot, storagePath);
    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);

    return { storagePath, fullPath, fileName };
  }

  async createFromUpload(chatbotId: string, file: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException('Missing uploaded file');

    const ext = extname(file.originalname).toLowerCase();
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

  async createFromUrl(chatbotId: string, dto: CreateDocumentFromUrlDto) {
    const url = dto.url;

    let res: { data: ArrayBuffer; headers: any; status: number };
    try {
      res = (await firstValueFrom(
        this.http.get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          maxRedirects: 5,
          validateStatus: (s) => s >= 200 && s < 300,
          // MVP: sem timeout custom, pode adicionar depois
        }),
      )) as any;
    } catch (err: any) {
      throw new BadRequestException(
        `Falha ao baixar arquivo da URL: ${err?.message ?? 'unknown'}`,
      );
    }

    const headers = res.headers ?? {};
    const mimeType = String(headers['content-type'] ?? '').split(';')[0].trim();

    // Descobre extensão/nome a partir de headers/URL
    let originalName =
      extractFilenameFromContentDisposition(headers['content-disposition']) ??
      basename(new URL(url).pathname) ??
      `document${mimeType === 'application/pdf' ? '.pdf' : ''}`;
    if (!originalName) {
      originalName = `document${mimeType === 'application/pdf' ? '.pdf' : ''}`;
    }

    originalName = sanitizeFilename(originalName);
    const ext = extname(originalName).toLowerCase();

    // Se ext não bate mas mime bate, força ext pelo mime
    const mimeToExt: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    };
    const forcedExt = mimeToExt[mimeType];
    if ((!ext || !ALLOWED_EXTENSIONS.has(ext)) && forcedExt) {
      originalName = `${originalName.replace(extname(originalName), '')}${forcedExt}`;
    }

    this.ensureAllowed(mimeType, originalName);

    const buffer = Buffer.from(res.data);
    const { storagePath } = await this.saveBufferToDisk(
      chatbotId,
      buffer,
      extname(originalName),
    );

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

  async createFromUrlForSwagger(chatbotId: string, dto: CreateDocumentFromUrlDto) {
    // helper (mantido para reduzir chance de erro em refactors)
    return this.createFromUrl(chatbotId, dto);
  }
}

