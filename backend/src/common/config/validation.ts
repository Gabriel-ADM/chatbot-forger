import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  BASE_URL: z.string().url(),
  N8N_WEBHOOK_CREATE_CHATBOT: z.string().url(),
  N8N_WEBHOOK_DOCUMENT_UPSERT: z.string().url(),
  N8N_WEBHOOK_STATUS: z.string().url(),
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  return envSchema.parse(config);
}
