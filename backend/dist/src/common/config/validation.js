"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    DATABASE_URL: zod_1.z.string().min(1),
    BASE_URL: zod_1.z.string().url(),
    N8N_WEBHOOK_CREATE_CHATBOT: zod_1.z.string().url(),
    N8N_WEBHOOK_DOCUMENT_UPSERT: zod_1.z.string().url(),
    N8N_WEBHOOK_STATUS: zod_1.z.string().url(),
});
function validateEnv(config) {
    return envSchema.parse(config);
}
//# sourceMappingURL=validation.js.map