import { Module } from '@nestjs/common';
import { ChatbotsController } from './chatbots.controller';
import { ChatbotsService } from './chatbots.service';
import { PrismaModule } from '../prisma/prisma.module';
import { N8nModule } from '../integrations/n8n/n8n.module';

@Module({
  imports: [PrismaModule, N8nModule],
  controllers: [ChatbotsController],
  providers: [ChatbotsService],
})
export class ChatbotsModule {}

