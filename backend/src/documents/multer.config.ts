import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx']);

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return '';
  return filename.slice(idx).toLowerCase();
}

export const multerUploadOptions = {
  storage: memoryStorage(),
  limits: {
    // MVP: ajuste conforme necessário
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const ext = getExtension(file.originalname);
    const mimetype = file.mimetype;

    const allowed =
      ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIME_TYPES.has(mimetype);

    if (!allowed) {
      return cb(
        new BadRequestException(
          'Tipo de arquivo inválido. Envie PDF, DOCX ou PPTX.',
        ),
        false,
      );
    }

    return cb(null, true);
  },
};

