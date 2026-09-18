# ADR 006: Disposable, Containerized Bot Host

## Status
Accepted

## Context
Discord's Gateway API relies on a stateful, persistent WebSocket connection to receive real-time guild events (`guildMemberAdd`, `guildMemberUpdate`, etc.). Serverless platforms (e.g. Vercel, AWS Lambda) terminate connections after short timeouts and cannot maintain persistent WebSockets. However, hosting the bot on a dedicated server introduces operational risk if the host fails or requires migration.

## Decision
Design the bot service (`apps/bot`) as a completely disposable, containerized Docker service:
1. Containerized with multi-stage Alpine Dockerfile and Docker Compose (`compose.yaml`).
2. Configured with `restart: unless-stopped` and capped memory limit (512MB).
3. The bot maintains zero persistent local state on disk. All state resides in Turso.
4. On startup, the bot runs a reconciliation sweep over guild members, guaranteeing full self-healing after any restart or container relocation.

## Consequences
- The bot container can be destroyed, restarted, or moved between servers (e.g., local home server, Oracle Cloud, DigitalOcean) with zero data loss and near-zero downtime.
- Clean separation from the web frontend hosted on Vercel.
