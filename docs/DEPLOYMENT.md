# ASC — Deployment & Operations Manual

## 1. Architecture Split

ASC is split across two operational environments:
1. **Web (`apps/web`)**: Deployed to **Vercel** serverless platform (Primary domain: `asc.necookie.dev`).
2. **Bot (`apps/bot`)**: Deployed as a persistent Docker container on an **Ubuntu Linux Host** (handles long-lived Discord Gateway WebSocket connections).
3. **Database**: Managed **Turso** (libSQL) distributed database.

---

## 2. Environment Configuration

### Required Environment Variables

```bash
# Database (Turso libSQL)
TURSO_DATABASE_URL=libsql://asc-db-yourtenant.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Discord Bot
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-id
DISCORD_GUILD_ID=your-community-guild-id
SYNC_INTERVAL=43200000

# Public URLs
NEXT_PUBLIC_APP_URL=https://asc.necookie.dev
NODE_ENV=production
```

---

## 3. Database Migrations

Migrations are managed with Drizzle Kit. Always execute migrations before updating web or bot containers:

```bash
# Run migrations against production database
pnpm --filter @asc/db migrate
```

---

## 4. Web Deployment (Vercel)

1. Connect the GitHub repository `https://github.com/Necookie/asc-monorepo.git` to Vercel.
2. Configure project settings:
   - **Root Directory**: `.`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm --filter @asc/web build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `pnpm install`
3. Add Environment Variables in Vercel Dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy and verify custom domain `asc.necookie.dev`.

---

## 5. Bot Deployment (Ubuntu Docker Host)

### 5.1 Dockerfile (`apps/bot/Dockerfile`)
The bot utilizes a multi-stage Alpine build with non-root security:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/validation/package.json ./packages/validation/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @asc/bot build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
USER node
CMD ["node", "apps/bot/dist/index.js"]
```

### 5.2 Docker Compose (`compose.yaml`)
```yaml
services:
  asc-bot:
    build:
      context: .
      dockerfile: apps/bot/Dockerfile
    container_name: asc-bot
    restart: unless-stopped
    env_file: .env
    deploy:
      resources:
        limits:
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"
```

### 5.3 Operating Commands on Ubuntu Host
```bash
# Clone or pull latest release
cd /opt/asc
git pull origin main

# Build and start bot in background
docker compose up -d --build

# View real-time logs
docker compose logs -f asc-bot

# Check container status and memory usage
docker stats asc-bot
```

---

## 6. Rollback & Disaster Recovery

### 6.1 Database Backup & Restore
- Turso provides continuous point-in-time recovery (PITR).
- To create a manual snapshot:
  ```bash
  turso db dump asc-db > backup-$(date +%Y%m%d).sql
  ```

### 6.2 Bot Rollback
```bash
# Revert to previous git commit or image tag
git checkout <previous-stable-commit>
docker compose up -d --build
```

### 6.3 Web Rollback
- Instant rollback in Vercel dashboard: promote previous deployment to Production.
