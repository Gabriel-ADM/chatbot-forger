"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = getConfiguration;
function getConfiguration() {
    return {
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        BASE_URL: process.env.BASE_URL,
        N8N_WEBHOOK_CREATE_CHATBOT: process.env.N8N_WEBHOOK_CREATE_CHATBOT,
        N8N_WEBHOOK_DOCUMENT_UPSERT: process.env.N8N_WEBHOOK_DOCUMENT_UPSERT,
        N8N_WEBHOOK_STATUS: process.env.N8N_WEBHOOK_STATUS,
    };
}
//# sourceMappingURL=configuration.js.map