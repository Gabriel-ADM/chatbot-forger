"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUploadOptions = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx']);
function getExtension(filename) {
    const idx = filename.lastIndexOf('.');
    if (idx === -1)
        return '';
    return filename.slice(idx).toLowerCase();
}
exports.multerUploadOptions = {
    storage: (0, multer_1.memoryStorage)(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const ext = getExtension(file.originalname);
        const mimetype = file.mimetype;
        const allowed = ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIME_TYPES.has(mimetype);
        if (!allowed) {
            return cb(new common_1.BadRequestException('Tipo de arquivo inválido. Envie PDF, DOCX ou PPTX.'), false);
        }
        return cb(null, true);
    },
};
//# sourceMappingURL=multer.config.js.map