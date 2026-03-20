# Build Vite (mesma origem /api via Nginx no estágio final)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-fund --no-audit

COPY . .

ARG VITE_API_BASE=/api
ARG VITE_ENABLE_BASE44_AUTH=false
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_ENABLE_BASE44_AUTH=$VITE_ENABLE_BASE44_AUTH

RUN npx prisma db seed
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
