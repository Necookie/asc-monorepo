# ASC — Authoritative MVP Scope Checklist

This document is the single authoritative checklist for MVP completion. Features are marked `[x]` only when implemented, integrated, and verified.

The 26 September 2026 review corrected unsupported completion claims below. See [READINESS_REVIEW.md](READINESS_REVIEW.md) for current release blockers, delivered changes, verification limits, and customization recommendations.

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
- [ ] **Environment Validation**: Schemas exist; application startup must invoke them and reject invalid synchronization intervals
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
- [x] **Public Route (`/[slug]`)**: Dynamic slug resolution for community member profiles
- [x] **Slug Redirection**: 308 Permanent Redirect when requesting historical slug aliases
- [x] **Reserved Slug Protection**: System routes (`admin`, `dashboard`, `api`, `members`, etc.) protected from collision
- [x] **Synchronized Identity Card**: Read-only display of verified Discord avatar, display name, handle, community roles, and tenure
- [x] **Custom Biography**: Sanitized text biography display
- [x] **Custom Title**: Profile title rendered when entitled
- [x] **Member Tags**: Visual badge display of selected community tags
- [x] **Verified External Links**: Sanitized, outbound links with safe HTTPS protocols and icons
- [x] **Custom Theme & Accent**: User-selected accent color applied to profile borders and highlights
- [x] **External Supporter Background**: Custom background image URL applied with safe styling and graceful fallback
- [x] **Server-Side Privacy Enforcement**: Hidden fields (roles, joined date, tags, links, or entire profile) stripped before rendering
- [x] **Former Member Handling**: Visual indicator for members who have left the community without breaking profile links
- [x] **404 Profile Not Found**: Custom empty/missing state adhering to `DESIGN.md`

---

## 4. Authentication & Identity Linking
- [x] **Clerk Integration**: `@clerk/nextjs` middleware and session provider configured
- [x] **Discord OAuth Provider**: Clerk configured for Discord OAuth authentication
- [x] **Identity Linkage Service**: Extract verified Discord snowflake from OAuth claims and link to `users.clerk_user_id`
- [x] **Zero-Trust Ownership**: Profile mutations strictly verified by `session.externalId === user.external_user_id`
- [x] **Rejection of Cross-Profile Mutations**: Explicit prevention of mutating another user's profile
- [x] **Rejection of Spoofing**: Username similarity and slug knowledge explicitly cannot grant ownership
- [x] **Protected Dashboard Access**: Unauthenticated visitors redirected to login

---

## 5. Community Surface
- [x] **Homepage (`/`)**:
  - [x] Atmospheric deep-indigo hero adhering to `DESIGN.md`
  - [x] Dynamic community statistics (total members, active profiles)
  - [x] Featured member showcase cards
  - [x] Primary conversion CTAs ("Meet ASC", "Explore Members", "Customize Profile")
- [x] **Member Directory (`/members`)**:
  - [x] Responsive grid of `MemberCard`s
  - [ ] Live search by username, display name, and tags (submitted search works; live search remains)
  - [ ] Role filter (Staff, Supporters, All) (Supporters/All work; Staff remains)
  - [x] Supporter badge highlighting
  - [x] Empty search state

---

## 6. Profile Customization & Dashboard
- [x] **Dashboard Shell (`/dashboard`)**: Calm, structured application mode interface
- [x] **Live Interactive Preview**: Real-time side-by-side local preview of profile changes before saving
- [x] **Profile Editor (`/dashboard/profile`)**: Mutation of bio, title, and external links with explicit save button
- [x] **Appearance Editor (`/dashboard/appearance`)**: Selection of theme, accent color, and supporter background URL
- [x] **Tag Selection (`/dashboard/tags`)**: Selection of tags from admin-approved community tags
- [x] **Privacy Settings (`/dashboard/privacy`)**: Toggle public profile, show roles, show joined date, show tags, show links
- [x] **Server Actions**: Secure, Zod-validated mutations

---

## 7. Administration & Moderation
- [x] **Server-Side Authorization**: Owner from Clerk private metadata; Admin/Moderator grants in ASC; server guards on routes and mutations
- [x] **Admin Overview (`/admin`)**: Key community metrics and quick health overview
- [ ] **Member Management (`/admin/members`)**: Inspection/status work; role history and complete pagination remain
- [x] **Profile Moderation (`/admin/profiles`)**: Separate server-owned visibility; member privacy cannot undo hides; resets require Admin
- [x] **Tag Management (`/admin/tags`)**: Create, edit, and deactivate community tags
- [ ] **Site Settings (`/admin/settings`)**: Values save; public maintenance/banner behavior remains
- [ ] **Audit Logging (`/admin/audit`)**: Actor/action/target/time rows exist; tamper-evidence guarantee remains

---

## 8. Quality & Security Gates
- [ ] **Responsive Design**: Public landing checked at 375px, 768px and 1440px; complete authenticated app review remains
- [ ] **Accessibility (a11y)**: Landing motion/keyboard checks pass; full focus/contrast review and remaining 40px controls need work
- [x] **Input Sanitization & Validation**: Zod validation on every input boundary; strict regex rejecting dangerous URL schemes
- [x] **Automated Test Coverage**:
  - [x] Unit tests for validation, permissions, and entitlements
  - [x] Database constraint and migration tests
  - [x] Synchronization lifecycle and idempotency tests
  - [x] Authentication ownership and authorization security tests
- [x] **Typecheck**: Zero TypeScript errors across all monorepo workspaces (`pnpm typecheck`)
- [ ] **Lint**: Replace placeholder success scripts with actual lint analysis and CI enforcement
- [x] **Production Build**: Successful Next.js production build (`pnpm build`)
- [x] **Documentation**: Full set of engineering specifications, ADRs, and deployment manuals
