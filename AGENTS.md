# AGENTS.md — Engineering Guide for Autonomous & Human Agents

Welcome to **ASC** (`asc.necookie.dev`). This document is the primary onboarding and operational guide for autonomous agents and engineers contributing to the ASC codebase.

---

## 1. What is ASC?

ASC is a community-first digital identity, member discovery, and profile customization platform.

### The Fundamental Product Premise
- **Automatic Profiles**: Every current member of the ASC community automatically has a public profile (`asc.necookie.dev/[slug]`).
- **No Manual Registration**: Members do **NOT** register to create profiles. Profiles originate automatically from synchronized community membership.
- **Claim & Customize**: When an existing member visits the website, they authenticate using Clerk OAuth (linking to their verified external provider ID) to access their already-existing profile and customize it.

---

## 2. Authoritative Documentation

All architectural decisions and specifications are documented in the repository. Consult these documents before making changes:

- `DESIGN.md`: The **authoritative visual specification**. Strictly defines all color tokens, typography, radii, spacing, component styling, animations, and layouts. Never replace with generic UI defaults.
- `docs/PRODUCT.md`: Vision, product principles, user personas, and feature hierarchy.
- `docs/MVP.md`: Authoritative MVP scope checklist.
- `docs/ARCHITECTURE.md`: Monorepo structure, data flow, boundaries, and system architecture.
- `docs/DATABASE.md`: Turso/libSQL Drizzle schema, table invariants, indexes, and relations.
- `docs/IDENTITY_AND_AUTH.md`: Invariant rules for identity, slug routing, Clerk authentication, and ownership verification.
- `docs/SYNC.md`: Discord Gateway bot synchronization lifecycle, event handling, idempotency, and reconciliation.
- `docs/API.md`: Server Actions, Route Handlers, and internal service APIs.
- `docs/SECURITY.md`: Threat model, URL scheme sanitization, SSRF/CSRF, authorization guards, and input limits.
- `docs/DEPLOYMENT.md`: Vercel (web) and Ubuntu Docker (bot) deployment procedures.
- `docs/TESTING.md`: Test strategy, Vitest setup, mocking policies, and verification gates.
- `docs/IMPLEMENTATION_STATUS.md`: Live matrix of subsystem implementation and verification status.
- `docs/adr/*`: Architectural Decision Records.

---

## 3. Core Architecture & Identity Invariants

### The Canonical Identity Invariant
> **The immutable external community user ID (Discord Snowflake) is the canonical member identity.**

```text
Immutable External ID (Identity)
          │
          ▼
       ASC User
       /      \
      /        \
 Profile      Membership
   │             │
   ├── Slugs     ├── Roles
   ├── Bio       ├── Status ('ACTIVE' | 'LEFT' | 'BANNED')
   ├── Tags      └── Supporter
   ├── Links
   └── Theme
```

- **Identity**: Immutable External ID (e.g. `123456789012345678`). Used for all foreign keys and authorization checks.
- **Presentation**: Username and Display Name. Synced dynamically; never used for authorization.
- **Routing**: Slugs (e.g. `/necookie`). Stored in `profile_slugs`. Changing username releases previous slug as an alias (redirects via 308).
- **Authentication Linkage**: Clerk ID (`user_2...`). Linked to `users.clerk_user_id` strictly via verified external account ID matching `users.external_user_id`.

### Membership Invariants
- When a member leaves the community, their status transitions to `LEFT`.
- **Leaving does NOT delete the user**, their customized profile, their links, or their history.
- When a member rejoins, their existing ASC identity is restored and a new `membership_period` is recorded.

---

## 4. Source-of-Truth Boundaries

1. **Community Platform (Discord)**: Authoritative for immutable member ID, username, display name, avatar, membership status, community roles, and supporter tier.
2. **Clerk**: Authoritative for browser authentication, OAuth handshake, and active sessions.
3. **Turso / libSQL**: Authoritative for ASC application data: users, Clerk linkage, profiles, slugs, membership periods, tags, links, privacy flags, entitlements, moderation actions, and audit logs.
4. **Next.js (Web)**: Responsible for server-side rendering, public routes, dashboard mutations, and server-side authorization enforcement.
5. **Sync Bot**: Independent Gateway service responsible for real-time member synchronization and reconciliation.

---

## 5. Security Invariants

- **Zero Trust on Client**: Authorization is strictly enforced server-side. Never rely on client-side state.
- **No Cross-Profile Ownership**: User A can only mutate User A's profile. Verify `session.externalId === user.external_user_id`.
- **External URL Safety**: All user-supplied links must use safe protocols (`https:`, `http:`). Strictly reject dangerous protocols (`javascript:`, `data:`, `file:`).
- **No User Media Storage**: ASC does not store image files. Backgrounds are stored as URLs. Broken background URLs gracefully fall back to ASC styling without breaking the UI.
- **Server-Side Privacy**: If a member hides roles, joined date, tags, or links, those fields must be stripped on the server before serialization.

---

## 6. Git Workflow

1. Permanent integration branch is `main`. Do not push broken states to `main`.
2. Work on dedicated feature branches (`feature/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>`).
3. Make frequent, coherent, meaningful micro-commits following Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
4. Run validation (`pnpm lint`, `pnpm typecheck`, `pnpm test`) on the feature branch.
5. Merge into `main` using `git merge --no-ff <branch>`. Do NOT squash.
6. Delete the feature branch after merging.
7. Push to `origin main` if credentials permit. If remote credentials are unavailable, mark push as `BLOCKED` and proceed with local development.

---

## 7. Where Future Agents Should Begin

1. Read this `AGENTS.md` and `DESIGN.md`.
2. Check `docs/IMPLEMENTATION_STATUS.md` to see current subsystem progress and active blockers.
3. Check `docs/MVP.md` for remaining scope requirements.
4. If working on database: see `docs/DATABASE.md` and `packages/db`.
5. If working on sync: see `docs/SYNC.md` and `apps/bot`.
6. If working on UI/Web: see `DESIGN.md`, `docs/API.md`, and `apps/web`.
7. Always run `pnpm test`, `pnpm typecheck`, and `pnpm lint` before completing any phase.
