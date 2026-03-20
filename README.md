# chatbot-forger

Monorepo com **backend** (NestJS + Prisma) e **front** (React + Vite).

Repositório: [github.com/Gabriel-ADM/chatbot-forger](https://github.com/Gabriel-ADM/chatbot-forger)

## Subir tudo com Docker Compose

Na **raiz** do projeto:

```bash
docker compose up --build
```

| Serviço | URL |
|--------|-----|
| Interface (Nginx + SPA) | [http://localhost:8080](http://localhost:8080) |
| API Nest (Postman, `/files`, etc.) | [http://localhost:3000](http://localhost:3000) |
| Swagger (se habilitado) | [http://localhost:3000/docs](http://localhost:3000/docs) |

O front em Docker chama a API em **`/api`**, que o Nginx encaminha para o serviço `backend:3000`. O caminho **`/files/`** também é proxied para o Nest (uploads).

### Variáveis do backend no Compose

Os webhooks **n8n** no `docker-compose.yml` estão como placeholders (`example.com`). Para criar chatbots, documentos e alternar status de verdade, altere para as URLs reais dos seus webhooks (ou use `environment` / `env_file`).

Referência de variáveis: [.env.example](.env.example).

### Porta 80 no host

Para usar a porta 80 em vez de 8080, em `docker-compose.yml` troque `8080:80` por `80:80` (pode exigir permissões de administrador no Linux).

---

## Deploy na Vercel (só o front)

A Vercel **não executa** o `docker-compose.yml`. O import do GitHub costuma publicar apenas o **frontend**.

1. [Importar o repositório](https://vercel.com/new) e definir **Root Directory** como `front`.
2. Framework: **Vite** (build `npm run build`, output `dist`).
3. **Environment Variables** (Build):
   - `VITE_API_BASE` = URL **pública** da API Nest (ex.: `https://api.seudominio.com`), **sem** barra no final.
   - `VITE_ENABLE_BASE44_AUTH` = `false` (recomendado para este projeto).

Em produção **não** existe proxy do Vite: o browser chama direto a URL em `VITE_API_BASE`. O backend precisa permitir **CORS** para o domínio da Vercel (`*.vercel.app` ou domínio customizado), ou você coloca API e front atrás do mesmo domínio com reverse proxy.

---

## Desenvolvimento local sem Docker

- **Backend:** pasta `backend` — ver [backend/README.md](backend/README.md).
- **Front:** pasta `front` — `npm install` e `npm run dev` (proxy `/api` → `http://127.0.0.1:3000` via Vite).

---

## Estrutura

```
├── backend/          # NestJS API
├── front/            # React + Vite
├── docker-compose.yml
└── README.md
```
