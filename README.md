# ASC (asc.necookie.dev)

ASC is a community-first digital identity, member discovery, and profile customization platform. Every current member of the ASC community automatically receives a public profile (`asc.necookie.dev/[slug]`).

Profiles are generated automatically through membership synchronization rather than manual registration. Members authenticate using Clerk (OAuth) to customize their verified profile.

## Key Features

- **Automatic Member Profiles**: Instant profile generation on community entry.
- **Synchronized Identity**: Immutable external ID (Discord Snowflake) serves as the canonical identity anchor. Real-time synchronization of roles, supporter tier, avatars, and membership history.
- **Public Profiles**: Highly expressive, customizable profile pages (`/[slug]`) adhering strictly to the ASC Design System.
- **Member Directory**: Full member discovery with responsive grid layout, real-time search, and tag/role filters (`/members`).
- **Profile Customization**: Member bio, custom titles (supporter entitled), external verified links, custom accent color, theme, and external backgrounds (`/dashboard`).
- **Server-Side Privacy**: Member control over public visibility of roles, joined date, tags, and links.
- **Administration & Moderation**: Server-side role-gated admin portal (`/admin`) for moderation, member overview, tag management, and audit logging.

## Tech Stack

- **Monorepo**: pnpm workspaces, TypeScript
- **Web**: Next.js (App Router), React, Tailwind CSS, shadcn/ui foundation customized to `DESIGN.md`, Lucide icons
- **Authentication**: Clerk with OAuth identity linking
- **Bot**: discord.js Gateway client for real-time member sync and periodic reconciliation
- **Database**: Turso / libSQL with Drizzle ORM
- **Validation**: Zod across all trust boundaries
- **Deployment**: Vercel (Web), Docker on Linux/Ubuntu (Bot)

## Monorepo Layout

```text
asc/
├── apps/
│   ├── web/                     # Next.js web application
│   └── bot/                     # discord.js synchronization bot
├── packages/
│   ├── db/                      # Turso/libSQL schema & Drizzle ORM
│   ├── validation/              # Zod validation schemas
│   ├── permissions/             # Role bitmasks and server authorization guards
│   ├── entitlements/            # Entitlement evaluation engine
│   ├── types/                   # Shared domain types
│   └── config/                  # Shared TypeScript/tooling configs
├── docs/                        # Engineering specifications & ADRs
└── compose.yaml                 # Docker Compose configuration
```

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run database migrations:
   ```bash
   pnpm db:migrate
   ```
4. Run development server:
   ```bash
   pnpm dev
   ```

For detailed engineering guides, see `/docs` and `AGENTS.md`.
