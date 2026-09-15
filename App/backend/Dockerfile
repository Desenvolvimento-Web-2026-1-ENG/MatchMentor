# Imagem de produção do backend (Express + Prisma + SQLite)
FROM node:22-alpine

# O Prisma precisa do OpenSSL para carregar as engines no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Instala as dependências (package-lock.json garante versões reproduzíveis no container)
COPY package*.json ./
RUN npm ci

# Copia o código e gera o client do Prisma antes de compilar o TypeScript
COPY . .
RUN npx prisma generate
RUN npm run build

# Script que aplica as migrações e sobe o servidor
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

CMD ["sh", "docker-entrypoint.sh"]
