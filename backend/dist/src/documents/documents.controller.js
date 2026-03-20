"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const from_url_dto_1 = require("./dto/from-url.dto");
const multer_config_1 = require("./multer.config");
let DocumentsController = class DocumentsController {
    documents;
    constructor(documents) {
        this.documents = documents;
    }
    upload(chatbotId, file) {
        return this.documents.createFromUpload(chatbotId, file);
    }
    createFromUrl(chatbotId, dto) {
        return this.documents.createFromUrl(chatbotId, dto);
    }
    findByChatbot(chatbotId) {
        return this.documents.listByChatbot(chatbotId);
    }
    softDelete(chatbotId, docId) {
        return this.documents.softDelete(chatbotId, docId);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Envia um documento (upload) para ingestão no RAG' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiCreatedResponse)({ type: Object }),
    (0, swagger_1.ApiParam)({ name: 'chatbotId', required: true }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerUploadOptions)),
    __param(0, (0, common_1.Param)('chatbotId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('from-url'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ingestão de documento a partir de URL (download no backend e ingestão via n8n)',
    }),
    (0, swagger_1.ApiCreatedResponse)({ type: Object }),
    (0, swagger_1.ApiParam)({ name: 'chatbotId', required: true }),
    __param(0, (0, common_1.Param)('chatbotId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, from_url_dto_1.CreateDocumentFromUrlDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "createFromUrl", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista documentos associados ao chatbot (inclui status)' }),
    (0, swagger_1.ApiOkResponse)({ type: Object }),
    __param(0, (0, common_1.Param)('chatbotId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findByChatbot", null);
__decorate([
    (0, common_1.Delete)(':docId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete do documento (status -> PENDING_DELETE)',
    }),
    (0, swagger_1.ApiOkResponse)({ type: Object }),
    __param(0, (0, common_1.Param)('chatbotId')),
    __param(1, (0, common_1.Param)('docId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "softDelete", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('documents'),
    (0, common_1.Controller)('chatbots/:chatbotId/documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map