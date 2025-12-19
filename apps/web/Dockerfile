# Frontend Dockerfile
# Multi-stage build for Next.js standalone output

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.json ./

# Copy packages
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src/

# Copy backend (required for tRPC type inference)
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/
COPY apps/backend/src ./apps/backend/src/

# Copy frontend
COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/next.config.js ./apps/web/
COPY apps/web/src ./apps/web/src/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client for backend (needed for types)
RUN pnpm --filter @next-nest-auth/backend db:generate

# Build shared package
RUN pnpm --filter @next-nest-auth/shared build

# Build frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @next-nest-auth/web build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/web

CMD ["node", "server.js"]
