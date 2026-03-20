import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChatbotDto {
  @ApiPropertyOptional({ example: 'Meu chatbot' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    example: 'Novo prompt do cliente',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  prompt_cliente?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

