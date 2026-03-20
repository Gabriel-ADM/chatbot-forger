import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_URL: z.ZodString;
    BASE_URL: z.ZodString;
    N8N_WEBHOOK_CREATE_CHATBOT: z.ZodString;
    N8N_WEBHOOK_DOCUMENT_UPSERT: z.ZodString;
    N8N_WEBHOOK_STATUS: z.ZodString;
}, z.core.$strip>;
export type EnvVars = z.infer<typeof envSchema>;
export declare function validateEnv(config: Record<string, unknown>): EnvVars;
export {};
