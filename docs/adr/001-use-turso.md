# ADR 001: Use Turso / libSQL for Persistence

## Status
Accepted

## Context
ASC requires a relational database that supports ACID transactions, foreign keys, and unique indexes to maintain community identity, profile slugs, role assignments, and audit logs. The application runs across two distinct environments: a serverless web application (`apps/web` on Vercel) and a long-running background synchronization daemon (`apps/bot` on Docker/Ubuntu). Traditional connection-pooled databases (e.g., PostgreSQL with pgBouncer) incur significant hosting complexity and cold-start connection penalties in edge/serverless environments.

## Decision
Adopt **Turso / libSQL** with **Drizzle ORM**.
1. `@libsql/client` communicates over lightweight HTTP/WebSocket protocols, natively supporting serverless Next.js functions on Vercel without connection exhaustion.
2. In local development and automated CI tests, `@libsql/client` supports local SQLite files (`file:local.db`) or in-memory databases (`:memory:`), removing the need for external network access or local Docker database instances.
3. Drizzle ORM provides lightweight, zero-overhead TypeScript type safety and explicit SQL migrations.

## Consequences
- Single unified database dialect (libSQL/SQLite) across serverless web and the sync bot.
- Extremely low operational cost and sub-millisecond local integration tests.
- SQLite lacks native network stored procedures, requiring transaction logic to run in TypeScript application code.
