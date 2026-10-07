# ASC deployment readiness and customization review

Reviewed 26 September 2026. **The approved member experience changes are implemented and locally verified. The full MVP still has release blockers.** A successful web build does not verify bot startup, production OAuth, or all moderation workflows.

## Delivered in this review

| Change | Result | Pull request |
| --- | --- | --- |
| Member sign-in | Embedded Discord sign-in, existing-profile dashboard redirect, separate outage and account-mismatch recovery, legacy editor redirect | [#1](https://github.com/Necookie/asc-monorepo/pull/1) |
| ASC account menu | Verified member identity, own public profile, editor, appearance, privacy, appropriate admin access, sign-out | [#2](https://github.com/Necookie/asc-monorepo/pull/2) |
| Community invitation | `https://discord.gg/afterschoolclub` on the landing page, footer and recovery page | [#3](https://github.com/Necookie/asc-monorepo/pull/3) |
| Clerk browser policy | Allows documented background workers and challenge frames; browser worker errors resolved | [#4](https://github.com/Necookie/asc-monorepo/pull/4) |
| Landing artwork | Sculpted ASC emblem, physical materials, theme-aware backing, demand-driven rendering, drag/arrows/Home/reset controls, vertical touch scrolling, still fallback | [#5](https://github.com/Necookie/asc-monorepo/pull/5) |
| Action authorization | Removed browser-controlled database/member overrides from public profile and admin actions; retained test injection in internal services; preserved expired-session redirects | [#6](https://github.com/Necookie/asc-monorepo/pull/6) |
| Booster and staff perks | Verified server boosters, moderators and administrators receive the enhanced studio; former-member roles do not grant privileges; saved appearance survives access loss | [#7](https://github.com/Necookie/asc-monorepo/pull/7) |
| Discovery privacy | Hidden profiles excluded before limits; hidden and retired tags cannot leak through search; hidden roles/badges cannot leak through supporter filtering | [#8](https://github.com/Necookie/asc-monorepo/pull/8) |

Every change used a separate feature/fix branch and coherent Conventional Commits, followed by a non-squash merge into `main` through an actual GitHub pull request.

## Resolved after this review
- **Owner-managed website staff access:** Separates Clerk owners from delegated Admin/Moderator grants. Moderation uses a server-owned flag that members cannot undo through privacy settings.
- **Bot production packaging (Blocker #1):** Configured `@asc/bot` with runtime `tsx` execution and updated `Dockerfile` runner stage to run standalone sync bot without TypeScript stripping failures.
- **Docker build context protection (Blocker #2):** Updated `.dockerignore` to strictly exclude all environment files (`.env*`), SQLite databases (`*.sqlite`, `*.db`), caches, and credentials from release images.
- **Startup configuration validation (Blocker #3):** Implemented `validateBotEnv` and `validateWebEnv` with finite positive interval requirements and secret-safe reporting (variable names only).
- **Public legal and policy pages:** Implemented `/privacy` and `/terms` pages adhering to `DESIGN.md` and restored footer links.
- **System announcement banner:** Connected `system_announcement` from `site_settings` to `SystemAnnouncementBanner` across all public pages with user dismiss action.
- **Directory staff filter:** Added privacy-safe staff filtering to `/members` directory that respects member role visibility settings.

## Remaining release blockers, in order

1. **Production identity and sync verification.** Test live Discord OAuth callback, new Clerk account linking, live Gateway events, and booster/staff role mappings on the staging/production deployment.
2. **Real lint and CI gates.** Configure an actual linter and CI checks for tests, types, lint, web build and bot runtime startup.

## Missing or incomplete MVP behavior

| Area | Current gap | Completion check |
| --- | --- | --- |
| Site settings | Maintenance mode actually gating intended routes with admin recovery access. | Public routes gate cleanly with admin recovery when maintenance mode is active. |
| Moderation/audit | Role history UI is absent; audit rows are stored but not cryptographically tamper-evident. | State the intended guarantee, implement it, and verify actor/target/history behavior. |
| Data integrity | Link/tag replacement and several sync/moderation operations span multiple statements. | Inject a mid-operation failure and confirm transactions preserve the previous complete state. |
| Accessibility | Landing keyboard and reduced-motion paths are checked, but full authenticated accessibility audit remains pending. | Verify all required 44px controls, contrast, focus, errors and keyboard flows on authenticated pages. |
| Perks | `canGradientAccent` is an entitlement flag without a corresponding editor/rendering feature. | Implement a constrained branded treatment or remove it from promised perks; follow `DESIGN.md` restrictions. |

## Current customization split

These are implemented capabilities, not new promises.

| Free members | Server boosters and staff |
| --- | --- |
| Biography, five links and five approved tags | Ten links and ten approved tags |
| Theme and custom accent color | Custom profile title and external background artwork |
| Classic and Split layouts | Arcade and Showcase layouts |
| Privacy controls and public shareable profile | Balanced/Bold/Playful typography, Pixel/Neon/Crest avatar frames, cover treatments/focal point and motion presets |

Staff means roles explicitly marked moderator or administrator, not roles whose names happen to contain those words. Booster recognition remains distinct from staff access: staff receive customization perks without being labelled boosters. Explicit administrator entitlement grants remain supported by the existing entitlement system.

When role access disappears, saved premium appearance is retained but the public presentation falls back to standard styling. Existing tests cover restoration when the role returns. Former members retain their identity and profile history while stale role relations cease granting staff/booster privileges.

## Customization ideas for the next iteration

| Free members | Booster and staff additions |
| --- | --- |
| Curated solid cover colors and a few ASC patterns | Larger authored cover collection and seasonal artwork |
| Favorite link, simple link ordering and a copy-profile-link action | Featured project section and richer link presentation |
| Interest groups using the same approved tags | Additional layout presets with more deliberate cover and typography choices |
| One-click appearance reset and accessible palette suggestions | Save and switch between two or three complete appearance presets |
| Preview a shared profile at phone and desktop sizes | Fine control over artwork crop and focal point |

Keep the useful identity/profile tools free. Put extra visual expression in the booster/staff tier, keep role badges verified, and use the same privacy and reduced-motion safeguards for every tier. These ideas are not implemented in this change set.

## Verification evidence and limits

- **150 tests pass** across 19 test files after the subsequent optimization pass. Coverage includes identity linking, forged action arguments, expired sessions, moderator/admin entitlements, former-member privileges, privacy-safe directory search, loading and aggregate regressions, and graphics resource disposal. [OPTIMIZATION_REVIEW.md](OPTIMIZATION_REVIEW.md) contains the latest browser and performance evidence.
- Workspace type checking passes. Existing lint scripts exit successfully but are placeholders, as noted above.
- Production web build passes. Bot TypeScript compilation passes; its plain-Node runtime check fails as described in the release blockers.
- Chromium checked the landing at 1440px in both themes, 768px and 375px. Drag, keyboard rotation, Home/reset, layout overflow and invitation URLs passed. Reduced motion, unavailable WebGL and context loss all produced still artwork. No unexpected browser errors appeared in the normal landing/login checks.
- Signed-out `/dashboard` redirected to the embedded Clerk Discord sign-in. Actual third-party sign-in and authenticated browser saves require the production verification listed above.
- Browser checks used a migrated temporary local database copied from the development database; they did not write to the production database. No production deployment was performed.

## Recommended release sequence

Fix bot packaging and moderation visibility first. Harden the Docker context and startup configuration, add real lint/CI gates, finish essential directory/settings/information pages, then run production OAuth and live Discord synchronization checks. Prefer a small member-only pilot before wider promotion. The next cosmetic work should be appearance presets and cover collections after these release gates are satisfied.
