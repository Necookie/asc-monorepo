# Multi-stage Dockerfile for ASC Discord Sync Bot
FROM node:22-alpine AS builder

WORKDIR /app

# Enable and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root manifest and workspace definition
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package manifests for cache-friendly dependency resolution
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/permissions/package.json ./packages/permissions/
COPY packages/entitlements/package.json ./packages/entitlements/
COPY packages/validation/package.json ./packages/validation/
COPY packages/db/package.json ./packages/db/
COPY apps/bot/package.json ./apps/bot/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy full repository source
COPY . .

# Build packages and compile bot TypeScript
RUN pnpm --filter @asc/bot build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init for PID 1 signal handling
RUN apk add --no-cache dumb-init

# Copy complete built artifacts and workspace dependencies
COPY --from=builder --chown=node:node /app ./

# Run as non-root user for security
USER node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/bot/dist/index.js"]
