# ASC — Authoritative MVP Scope Checklist

This document is the single authoritative checklist for MVP completion. Features are marked `[x]` only when implemented, integrated, and verified.

---

## 1. Foundation & Infrastructure
- [x] **Monorepo Workspace**: pnpm workspaces configured with `apps/` and `packages/`
- [ ] **Web Application**: Next.js App Router application in `apps/web`
- [ ] **Synchronization Bot**: discord.js Gateway service in `apps/bot`
- [x] **Database Package**: Drizzle ORM + Turso/libSQL client in `packages/db`
- [x] **Shared Packages**:
  - [x] `packages/config` (shared TypeScript config)
  - [x] `packages/types` (shared domain models)
  - [x] `packages/validation` (Zod validation schemas)
  - [x] `packages/permissions` (role bitmasks & server guards)
  - [x] `packages/entitlements` (entitlement resolver)
- [x] **Environment Validation**: Zod schema validating required environment variables on startup
- [x] **Automated Testing Suite**: Vitest configured for root, packages, and apps
- [ ] **Containerization**: Multi-stage `apps/bot/Dockerfile` and root `compose.yaml`

---

## 2. Synchronization Subsystem
- [x] **Gateway Connection**: Robust discord.js client with auto-reconnect and rate-limit handling
- [x] **Initial Member Synchronization**: Paginated guild fetch synchronizing all members on cold startup
- [x] **Member Join (`guildMemberAdd`)**: Automatic creation of user, default profile, canonical slug, and membership period
- [x] **Member Departure (`guildMemberRemove`)**: Status set to `LEFT`, close membership period; profile and customizations preserved
- [x] **Member Rejoin**: Restore status to `ACTIVE`, start new membership period, retain existing customized profile
- [x] **Username Changes (`userUpdate`)**: Update presentation username, generate new primary slug, preserve old slug as 308 alias
- [x] **Avatar Changes**: Real-time update of synchronized avatar URL
- [x] **Role Synchronization**: Synchronize Discord roles with `community_roles` and `member_roles`
- [x] **Supporter Synchronization**: Detect booster/supporter role and assign supporter entitlements
- [x] **Periodic Reconciliation**: Configurable scheduled sync loop (default 12h) healing missed events
- [x] **Idempotent Operations**: Repeating the same event N times results in identical database state without duplicate records
- [x] **Graceful Shutdown**: Clean exit on `SIGTERM` / `SIGINT` without corrupting active sync transactions

---

## 3. Profiles & Public Surface
- [ ] **Public Route (`/[slug]`)**: Dynamic slug resolution for community member profiles
- [ ] **Slug Redirection**: 308 Permanent Redirect when requesting historical slug aliases
- [ ] **Reserved Slug Protection**: System routes (`admin`, `dashboard`, `api`, `members`, etc.) protected from collision
- [ ] **Synchronized Identity Card**: Read-only display of verified Discord avatar, display name, handle, community roles, and tenure
- [ ] **Custom Biography**: Sanitized text biography display
- [ ] **Custom Title**: Profile title rendered when entitled
- [ ] **Member Tags**: Visual badge display of selected community tags
- [ ] **Verified External Links**: Sanitized, outbound links with safe HTTPS protocols and icons
- [ ] **Custom Theme & Accent**: User-selected accent color applied to profile borders and highlights
- [ ] **External Supporter Background**: Custom background image URL applied with safe styling and graceful fallback
- [ ] **Server-Side Privacy Enforcement**: Hidden fields (roles, joined date, tags, links, or entire profile) stripped before rendering
- [ ] **Former Member Handling**: Visual indicator for members who have left the community without breaking profile links
- [ ] **404 Profile Not Found**: Custom empty/missing state adhering to `DESIGN.md`

---

## 4. Authentication & Identity Linking
- [ ] **Clerk Integration**: `@clerk/nextjs` middleware and session provider configured
- [ ] **Discord OAuth Provider**: Clerk configured for Discord OAuth authentication
- [ ] **Identity Linkage Service**: Extract verified Discord snowflake from OAuth claims and link to `users.clerk_user_id`
- [ ] **Zero-Trust Ownership**: Profile mutations strictly verified by `session.externalId === user.external_user_id`
- [ ] **Rejection of Cross-Profile Mutations**: Explicit prevention of mutating another user's profile
- [ ] **Rejection of Spoofing**: Username similarity and slug knowledge explicitly cannot grant ownership
- [ ] **Protected Dashboard Access**: Unauthenticated visitors redirected to login

---

## 5. Community Surface
- [ ] **Homepage (`/`)**:
  - [ ] Atmospheric deep-indigo hero adhering to `DESIGN.md`
  - [ ] Dynamic community statistics (total members, active profiles)
  - [ ] Featured member showcase cards
  - [ ] Primary conversion CTAs ("Meet ASC", "Explore Members", "Customize Profile")
- [ ] **Member Directory (`/members`)**:
  - [ ] Responsive grid of `MemberCard`s
  - [ ] Live search by username, display name, and tags
  - [ ] Role filter (Staff, Supporters, All)
  - [ ] Supporter badge highlighting
  - [ ] Empty search state

---

## 6. Profile Customization & Dashboard
- [ ] **Dashboard Shell (`/dashboard`)**: Calm, structured application mode interface
- [ ] **Live Interactive Preview**: Real-time side-by-side local preview of profile changes before saving
- [ ] **Profile Editor (`/dashboard/profile`)**: Mutation of bio, title, and external links with explicit save button
- [ ] **Appearance Editor (`/dashboard/appearance`)**: Selection of theme, accent color, and supporter background URL
- [ ] **Tag Selection (`/dashboard/tags`)**: Selection of tags from admin-approved community tags
- [ ] **Privacy Settings (`/dashboard/privacy`)**: Toggle public profile, show roles, show joined date, show tags, show links
- [ ] **Server Actions**: Secure, Zod-validated mutations

---

## 7. Administration & Moderation
- [ ] **Server-Side Authorization**: Administrative routes and mutations strictly gated by verified `is_admin` role
- [ ] **Admin Overview (`/admin`)**: Key community metrics and quick health overview
- [ ] **Member Management (`/admin/members`)**: Member inspection, status viewer, and role history
- [ ] **Profile Moderation (`/admin/profiles`)**: One-click profile hide/unhide and reset unsafe bio/links/background
- [ ] **Tag Management (`/admin/tags`)**: Create, edit, and deactivate community tags
- [ ] **Site Settings (`/admin/settings`)**: Maintenance toggle and system announcement banner
- [ ] **Audit Logging (`/admin/audit`)**: Tamper-evident audit log recording actor, action, target, and timestamp

---

## 8. Quality & Security Gates
- [ ] **Responsive Design**: Flawless presentation across mobile (375px), tablet (768px), and desktop (1280px+)
- [ ] **Accessibility (a11y)**: Semantic HTML, visible focus states, ≥44px touch targets, `prefers-reduced-motion` compliance
- [ ] **Input Sanitization & Validation**: Zod validation on every input boundary; strict regex rejecting dangerous URL schemes
- [ ] **Automated Test Coverage**:
  - [ ] Unit tests for validation, permissions, and entitlements
  - [ ] Database constraint and migration tests
  - [ ] Synchronization lifecycle and idempotency tests
  - [ ] Authentication ownership and authorization security tests
- [ ] **Typecheck**: Zero TypeScript errors across all monorepo workspaces (`pnpm typecheck`)
- [ ] **Lint**: Zero ESLint errors or warnings (`pnpm lint`)
- [ ] **Production Build**: Successful Next.js production build (`pnpm build`)
- [ ] **Documentation**: Full set of engineering specifications, ADRs, and deployment manuals
