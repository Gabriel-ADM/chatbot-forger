---
name: Nest RAG manager API
overview: Criar uma API REST monolítica em NestJS para gerenciar Chatbots e Documentos (RAG), com Prisma+SQLite, upload de arquivos, webhooks para n8n, validação, tratamento de erros e Swagger; além de preparar pasta `front/` e um Dockerfile para o backend.
todos:
  - id: scaffold-backend
    content: Criar projeto Nest em `backend/` com módulos `chatbots`, `documents`, `integrations/n8n`, Swagger e pipes/filtros globais.
    status: in_progress
  - id: prisma-models
    content: Adicionar Prisma+SQLite, definir `Chatbot`/`Document` e gerar migração inicial.
    status: pending
  - id: chatbots-endpoints
    content: Implementar POST/GET/PUT/PATCH status para `chatbots` com validação e webhooks n8n.
    status: pending
  - id: documents-endpoints
    content: Implementar upload Multer, listagem, e soft delete de documentos com validação de tipo e webhook n8n.
    status: pending
  - id: uploads-serving
    content: Expor arquivos de `uploads/` via URL pública e montar `publicUrl` usando `BASE_URL`.
    status: pending
  - id: docker-and-front
    content: Criar `backend/Dockerfile`, `.env.example` e pasta `front/` com README placeholder.
    status: pending
isProject: false
---

# API Nest para gerenciar RAG (Chatbots + Documentos)

## Objetivo

- Implementar um monólito modular em NestJS com:
  - CRUD de `Chatbot`.
  - Gestão de `Document` (upload, listagem, soft delete).
  - Webhooks HTTP para n8n (criação do fluxo, ingestão em base vetorial, ativar/desativar fluxo).
  - Validação de entrada (ex.: `prompt_cliente` com **máx. 200 chars**).
  - Tratamento de erros consistente.
  - Documentação via Swagger.
  - Pasta `front/` (placeholder inicial) e `Dockerfile` para o backend.

## Decisões assumidas (confirmadas)

- **Banco**: Prisma + SQLite (MVP).
- **Webhooks n8n**: URLs via env vars.
- **Uploads**: salvar em disco local (`backend/uploads/`) e expor URL pública para o n8n consumir.
- **Webhook auth**: JSON simples (sem assinatura) no MVP.

## Estrutura de diretórios

- `backend/`
  - `src/`
    - `app.module.ts`
    - `main.ts` (Swagger + prefix opcional)
    - `common/`
      - `filters/http-exception.filter.ts` (normalizar erros)
      - `config/configuration.ts` + `config/validation.ts` (env)
    - `integrations/n8n/` (cliente de webhook)
      - `n8n.module.ts`
      - `n8n.service.ts`
    - `chatbots/`
      - `chatbots.module.ts`
      - `chatbots.controller.ts`
      - `chatbots.service.ts`
      - `dto/` (Create/Update/Status)
    - `documents/`
      - `documents.module.ts`
      - `documents.controller.ts`
      - `documents.service.ts`
      - `dto/` + `multer.config.ts`
    - `prisma/`
      - `prisma.module.ts`
      - `prisma.service.ts`
  - `prisma/schema.prisma`
  - `uploads/` (armazenamento local)
  - `Dockerfile`
  - `.env.example`
- `front/`
  - `README.md` (placeholder com instruções do front)

## Modelo de dados (Prisma)

- `Chatbot`
  - `id` (cuid)
  - `nome` (string)
  - `prompt_cliente` (string, **<= 200**)
  - `active` (boolean, default true)
  - `createdAt`, `updatedAt`
  - relação 1:N com `Document`
- `Document`
  - `id` (cuid)
  - `chatbotId` (FK)
  - `originalName`, `mimeType`, `size`
  - `storagePath` (caminho no disco)
  - `publicUrl` (URL pública para download pelo n8n)
  - `status` enum: `ACTIVE | PENDING_DELETE`
  - `createdAt`, `updatedAt`

## Configuração via env

- `PORT` (default 3000)
- `DATABASE_URL` (SQLite)
- `BASE_URL` (ex.: `http://localhost:3000` para montar `publicUrl` do arquivo)
- `N8N_WEBHOOK_CREATE_CHATBOT`
- `N8N_WEBHOOK_DOCUMENT_UPSERT`
- `N8N_WEBHOOK_STATUS`

## Endpoints (comportamento esperado)

### 1) POST `/chatbots`

- **Body obrigatório**: `{ nome: string, prompt_cliente: string(max 200) }`
- **Efeito**:
  - Cria no banco local.
  - Dispara webhook para n8n criar/instanciar fluxo a partir de template.
- **Webhook (JSON)** (proposta):
  - `{ chatbotId, nome, prompt_cliente, active }`

### 2) GET `/chatbots`

- Lista chatbots (com paginação simples opcional no MVP: `?skip=&take=`).

### 3) PUT `/chatbots/:id`

- Atualiza configurações (nome/prompt) no banco.
- (Opcional MVP) Pode disparar webhook de “config updated” se você quiser evoluir; por ora manter apenas update local.

### 4) POST `/chatbots/:id/documents`

- Upload via Multer (multipart/form-data) com field `file`.
- **Tipos aceitos**: PDF, DOCX, PPTX.
- Salva no disco local e registra no banco.
- Retorna registro do documento.
- Dispara webhook para n8n inserir documento na base vetorial.
- **Webhook (JSON)** (proposta):
  - `{ chatbotId, documentId, publicUrl, storagePath, originalName, mimeType, size }`

### 5) GET `/chatbots/:id/documents`

- Lista documentos do chatbot com `status`.

### 6) DELETE `/chatbots/:id/documents/:docId`

- Implementa **soft delete**:
  - Atualiza `status = PENDING_DELETE` no banco.
  - Não remove arquivo no disco (n8n/rotina externa cuidará).

### 7) PATCH `/chatbots/:id/status`

- Body: `{ active: boolean }`
- Atualiza `active`.
- Dispara webhook para n8n pausar/reativar fluxo associado no Telegram.
- **Webhook (JSON)** (proposta):
  - `{ chatbotId, active }`

## Tratamento de erros e validação

- Validar DTOs com `class-validator` + `ValidationPipe` global.
- Erros padronizados (ex.: `400` validação, `404` chatbot/doc não encontrado, `415` tipo de arquivo inválido).
- Swagger (`@nestjs/swagger`) com schemas, exemplos e descrição dos endpoints.

## Dockerfile (backend)

- Multi-stage build:
  - build (instala deps, gera prisma client, compila `dist`)
  - runtime (node slim/alpine, copia `dist`, prisma client, migrações)
- Expor porta `3000`.

## Entregáveis

- Projeto Nest em `backend/` totalmente funcional.
- Prisma schema + migração inicial.
- Swagger em `/docs`.
- Uploads servidos (ex.: rota `/files/:filename` ou `ServeStaticModule`).
- Pasta `front/` criada.

## Testes rápidos (manuais)

- Criar chatbot e verificar chamada ao webhook.
- Fazer upload de PDF/DOCX/PPTX e verificar registro + webhook.
- Soft delete e status do documento.
- Toggle active e webhook.

