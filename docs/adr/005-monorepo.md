# ADR 005: pnpm Monorepo Architecture

## Status
Accepted

## Context
ASC consists of a Next.js web application (`apps/web`), a Discord Gateway bot (`apps/bot`), and several shared subsystems: database schemas, validation rules, TypeScript types, permissions, and entitlements. Maintaining these as separate repositories would lead to schema drift, duplicated code, fragmented CI, and complex local development workflows. Conversely, a monolithic single-package project would couple serverless web dependencies with stateful Discord bot dependencies.

## Decision
Use a **pnpm Workspaces** monorepo:
- `apps/web`: Next.js (App Router), Tailwind CSS.
- `apps/bot`: discord.js Gateway client.
- `packages/db`: Drizzle ORM schema, migrations, and database client factory.
- `packages/validation`: Shared Zod validation schemas.
- `packages/permissions`: Role bitmasks and authorization logic.
- `packages/entitlements`: Capability and tier resolver.
- `packages/types`: Shared domain interfaces.
- `packages/config`: Base compiler and lint configurations.

## Consequences
- Complete type safety across web, bot, and database.
- Atomic commits and synchronized migrations across apps.
- Single command for local testing (`pnpm test`) and building.
- Clean isolation between serverless dependencies (`@clerk/nextjs`) and persistent daemon dependencies (`discord.js`).
