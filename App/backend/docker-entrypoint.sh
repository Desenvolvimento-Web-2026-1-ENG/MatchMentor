#!/bin/sh
set -e

# Aplica as migrações pendentes no banco (SQLite no volume /app/data)
npx prisma migrate deploy

# Sobe a API compilada (dist/infrastructure/http/server.js)
node dist/infrastructure/http/server.js
