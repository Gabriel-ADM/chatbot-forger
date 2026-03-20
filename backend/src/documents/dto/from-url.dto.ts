import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateDocumentFromUrlDto {
  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'URL direta para o arquivo (PDF/DOCX/PPTX)',
    maxLength: 2048,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  url: string;
}

