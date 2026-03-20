import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { DocumentsService } from './documents.service';
import { CreateDocumentFromUrlDto } from './dto/from-url.dto';
import { multerUploadOptions } from './multer.config';

@ApiTags('documents')
@Controller('chatbots/:chatbotId/documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Envia um documento (upload) para ingestão no RAG' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({ type: Object })
  @ApiParam({ name: 'chatbotId', required: true })
  @UseInterceptors(FileInterceptor('file', multerUploadOptions))
  upload(
    @Param('chatbotId') chatbotId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documents.createFromUpload(chatbotId, file);
  }

  @Post('from-url')
  @ApiOperation({
    summary:
      'Ingestão de documento a partir de URL (download no backend e ingestão via n8n)',
  })
  @ApiCreatedResponse({ type: Object })
  @ApiParam({ name: 'chatbotId', required: true })
  createFromUrl(
    @Param('chatbotId') chatbotId: string,
    @Body() dto: CreateDocumentFromUrlDto,
  ) {
    return this.documents.createFromUrl(chatbotId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista documentos associados ao chatbot (inclui status)' })
  @ApiOkResponse({ type: Object })
  findByChatbot(@Param('chatbotId') chatbotId: string) {
    return this.documents.listByChatbot(chatbotId);
  }

  @Delete(':docId')
  @ApiOperation({
    summary: 'Soft delete do documento (status -> PENDING_DELETE)',
  })
  @ApiOkResponse({ type: Object })
  softDelete(
    @Param('chatbotId') chatbotId: string,
    @Param('docId') docId: string,
  ) {
    return this.documents.softDelete(chatbotId, docId);
  }
}

