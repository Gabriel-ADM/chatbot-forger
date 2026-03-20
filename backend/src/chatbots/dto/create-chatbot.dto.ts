import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChatbotDto {
  @ApiProperty({ example: 'Minha IA', description: 'Nome do chatbot' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 'Você é um assistente comunicacional...',
    description: 'Prompt do cliente (max 200 caracteres)',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  prompt_cliente: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Se o chatbot está ativo inicialmente',
  })
  @IsBoolean()
  active?: boolean;
}

