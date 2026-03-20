import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetChatbotStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}

