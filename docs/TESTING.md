# ASC — Testing Strategy & Verification Plan

## 1. Testing Philosophy & Stack

ASC employs automated testing across all packages and services using **Vitest**.
- Fast, native TypeScript execution.
- Shared mock fixtures for external providers (Discord Gateway and Clerk).
- In-memory SQLite (`:memory:`) or local file (`file:local.db`) for realistic database integration tests.

---

## 2. Test Suites Overview

### 2.1 Validation Tests (`packages/validation`)
Targeted verification of all user input trust boundaries:
- **URL Schemes**:
  - Valid: `https://github.com/necookie`, `https://example.com/project`.
  - Dangerous / Invalid: `javascript:alert(1)`, `data:text/html,...`, `file:///etc/passwd`, `vbscript:...`.
- **String Length Limits**:
  - `bio`: Max 500 chars (reject 501+).
  - `customTitle`: Max 64 chars (reject 65+).
  - `links`: Limit array count (e.g. max 5 for standard, 10 for supporter).
  - `accentColor`: Hex regex validation (`#5865f2`, `#ffffff`, reject `red` or malformed hex).
- **Privacy Toggles**:
  - Strict boolean validation.

---

### 2.2 Permissions & Entitlements Tests (`packages/permissions`, `packages/entitlements`)
- **Role Evaluation**:
  - Admin role check (`is_admin: true`).
  - Moderator role check (`is_moderator: true`).
  - Supporter role check (`is_supporter: true`).
- **Entitlement Resolution**:
  - Supporter member gets `'profile.background'` = `true`, `'profile.custom_title'` = `true`, `'profile.max_links'` = `10`.
  - Non-supporter gets defaults (`'profile.background'` = `false`, `'profile.custom_title'` = `false`, `'profile.max_links'` = `5`).
  - Expired entitlement is disabled without deleting saved profile state.

---

### 2.3 Database Invariant Tests (`packages/db`)
- Unique constraints:
  - `users.external_user_id` unique constraint violations throw.
  - `users.clerk_user_id` unique constraint.
  - `profile_slugs.slug` uniqueness.
- Foreign Key cascading:
  - Deleting a user cascades to profile, slugs, membership periods, and member roles.
- Membership Periods:
  - Multiple non-overlapping periods recorded per user across sequential joins/leaves.

---

### 2.4 Synchronization Tests (`apps/bot`)
Using mock Discord Guild Member fixtures:
1. **Initial Member Ingestion**: Batch upsert of 50+ members into clean DB.
2. **Member Join (`guildMemberAdd`)**: Creates user, default profile, canonical slug, and opens membership period.
3. **Duplicate Events (Idempotency)**: Sending 5 consecutive identical `guildMemberAdd` events produces exactly 1 user, 1 profile, and 1 active membership period.
4. **Member Departure (`guildMemberRemove`)**: Status updates to `'LEFT'`, closes period; profile customizations remain intact.
5. **Member Rejoin**: Status restored to `'ACTIVE'`, starts new period, retains custom bio/links.
6. **Username Changes**:
   - `dheyn` -> `necookie`: Updates `users.username`, mints new primary slug `necookie`, marks `dheyn` as released alias.
7. **Role Transitions**:
   - Granting supporter role updates entitlements.
   - Removing supporter role deactivates entitlements.
8. **Reconciliation**:
   - Simulates offline drift and confirms that reconciliation repairs missed joins and departures.

---

### 2.5 Security & Authorization Tests (`apps/web`)
Mandatory security test cases:
1. **Cross-Profile Ownership**: User A (Clerk session A) explicitly cannot edit User B's profile. Fails with `403 Forbidden`.
2. **Unauthenticated Mutations**: Submitting Server Actions without session cookie fails with `401 Unauthorized`.
3. **Admin Gating**: Non-admin user invoking `adminModerateProfileAction` fails with `403 Forbidden`.
4. **Client State Spoofing**: Supplying `{ isAdmin: true }` in client request payload is ignored.
5. **Username Similarity & Slug Knowledge**: Knowing a slug or having a similar display name confers zero ownership rights.

---

## 3. Verification Commands

```bash
# Run all automated tests across monorepo
pnpm test

# Run TypeScript typechecks
pnpm typecheck

# Run ESLint across all workspaces
pnpm lint

# Verify production builds
pnpm build
```

---

## 4. Visual & Manual Verification

- Viewports:
  - Mobile: `375px` (no horizontal scrolling, menu drawer works, touch targets >= 44px).
  - Tablet: `768px` (responsive grid, adapted hero).
  - Desktop: `1280px+` (full canvas gradient mesh, side-by-side dashboard editor).
- State Verification:
  - Loading skeletons.
  - Empty states (e.g. no members match search).
  - Error banners.
  - 404 Profile Not Found with custom `DESIGN.md` styling.
