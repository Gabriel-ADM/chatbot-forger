import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ChatbotsService } from './chatbots.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { SetChatbotStatusDto } from './dto/status-chatbot.dto';

@ApiTags('chatbots')
@Controller('chatbots')
export class ChatbotsController {
  constructor(private readonly chatbots: ChatbotsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um chatbot e dispara webhook no n8n' })
  @ApiCreatedResponse({ type: Object })
  create(@Body() dto: CreateChatbotDto) {
    return this.chatbots.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista chatbots' })
  @ApiOkResponse({ type: Object })
  findAll() {
    return this.chatbots.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza configurações do chatbot' })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: Object })
  update(@Param('id') id: string, @Body() dto: UpdateChatbotDto) {
    return this.chatbots.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Ativa/Desativa chatbot (dispara webhook para n8n/TG)',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: Object })
  setStatus(@Param('id') id: string, @Body() dto: SetChatbotStatusDto) {
    return this.chatbots.setStatus(id, dto.active);
  }
}

