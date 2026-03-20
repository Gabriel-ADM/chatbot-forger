FROM node:20-alpine AS builder

WORKDIR /app

# Instala ferramentas necessárias para o better-sqlite3 compilar no Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --no-fund --no-audit

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copia o novo arquivo de configuração para o Prisma conseguir rodar o migrate deploy
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# DB em /app/data para poder montar volume só aqui sem sobrescrever /app/prisma (migrations ficam na imagem).
RUN mkdir -p ./uploads ./data

ENV PORT=3000
ENV DATABASE_URL="file:/app/data/dev.db"

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]