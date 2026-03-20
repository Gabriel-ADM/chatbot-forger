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
exports.ChatbotsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chatbots_service_1 = require("./chatbots.service");
const create_chatbot_dto_1 = require("./dto/create-chatbot.dto");
const update_chatbot_dto_1 = require("./dto/update-chatbot.dto");
const status_chatbot_dto_1 = require("./dto/status-chatbot.dto");
let ChatbotsController = class ChatbotsController {
    chatbots;
    constructor(chatbots) {
        this.chatbots = chatbots;
    }
    create(dto) {
        return this.chatbots.create(dto);
    }
    findAll() {
        return this.chatbots.findAll();
    }
    update(id, dto) {
        return this.chatbots.update(id, dto);
    }
    setStatus(id, dto) {
        return this.chatbots.setStatus(id, dto.active);
    }
};
exports.ChatbotsController = ChatbotsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria um chatbot e dispara webhook no n8n' }),
    (0, swagger_1.ApiCreatedResponse)({ type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chatbot_dto_1.CreateChatbotDto]),
    __metadata("design:returntype", void 0)
], ChatbotsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista chatbots' }),
    (0, swagger_1.ApiOkResponse)({ type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChatbotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza configurações do chatbot' }),
    (0, swagger_1.ApiParam)({ name: 'id', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_chatbot_dto_1.UpdateChatbotDto]),
    __metadata("design:returntype", void 0)
], ChatbotsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ativa/Desativa chatbot (dispara webhook para n8n/TG)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', required: true }),
    (0, swagger_1.ApiOkResponse)({ type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, status_chatbot_dto_1.SetChatbotStatusDto]),
    __metadata("design:returntype", void 0)
], ChatbotsController.prototype, "setStatus", null);
exports.ChatbotsController = ChatbotsController = __decorate([
    (0, swagger_1.ApiTags)('chatbots'),
    (0, common_1.Controller)('chatbots'),
    __metadata("design:paramtypes", [chatbots_service_1.ChatbotsService])
], ChatbotsController);
//# sourceMappingURL=chatbots.controller.js.map