# Multi-stage Dockerfile for ASC Next.js Web Application
FROM node:22-alpine AS builder

WORKDIR /app

# Enable and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root manifest and workspace definition
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package manifests for workspace resolution
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/permissions/package.json ./packages/permissions/
COPY packages/entitlements/package.json ./packages/entitlements/
COPY packages/validation/package.json ./packages/validation/
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy full repository source
COPY . .

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build web application
RUN pnpm --filter @asc/web build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache dumb-init curl
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder --chown=node:node /app ./

USER node

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["pnpm", "--filter", "@asc/web", "start"]
