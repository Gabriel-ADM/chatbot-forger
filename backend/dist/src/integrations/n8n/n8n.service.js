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
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let N8nService = class N8nService {
    config;
    http;
    baseUrl;
    constructor(config, http) {
        this.config = config;
        this.http = http;
        this.baseUrl = this.config.get('N8N_BASE_URL') ?? '';
    }
    async createOrInstantiateChatbot(payload) {
        const url = this.config.get('N8N_WEBHOOK_CREATE_CHATBOT');
        if (!url)
            throw new common_1.HttpException('Missing N8N webhook URL', 500);
        await this.postJson(url, payload);
    }
    async upsertDocument(payload) {
        const url = this.config.get('N8N_WEBHOOK_DOCUMENT_UPSERT');
        if (!url)
            throw new common_1.HttpException('Missing N8N webhook URL', 500);
        await this.postJson(url, payload);
    }
    async updateChatbotStatus(payload) {
        const url = this.config.get('N8N_WEBHOOK_STATUS');
        if (!url)
            throw new common_1.HttpException('Missing N8N webhook URL', 500);
        await this.postJson(url, payload);
    }
    async postJson(url, payload) {
        try {
            const res = await (0, rxjs_1.firstValueFrom)(this.http.post(url, payload, {
                headers: { 'content-type': 'application/json' },
            }));
            return res.data;
        }
        catch (err) {
            const message = err?.response?.data?.message ??
                err?.message ??
                'Failed calling n8n webhook';
            throw new common_1.HttpException({ message, details: err?.response?.data }, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.N8nService = N8nService;
exports.N8nService = N8nService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], N8nService);
//# sourceMappingURL=n8n.service.js.map