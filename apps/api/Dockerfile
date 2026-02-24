FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY prisma/ ./prisma/

RUN pnpm install --frozen-lockfile || pnpm install

COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

RUN pnpm --filter @lifeos/api db:generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema ./prisma/schema.prisma && pnpm --filter @lifeos/api dev"]
