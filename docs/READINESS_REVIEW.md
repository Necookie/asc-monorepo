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

## Release blockers, in order

1. **Bot production packaging.** `pnpm --filter @asc/bot build` succeeds, but the compiled entrypoint fails under local Node 24.19.0 with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` when it loads `@asc/db/src/index.ts` through `node_modules`. Shared packages export TypeScript source while the bot runner starts plain Node. Compile/bundle shared runtime dependencies or deliberately provide a supported TypeScript runtime; then verify the actual Node 22 Docker image starts and performs reconciliation. Relevant files: `apps/bot/package.json`, `apps/bot/Dockerfile`, shared package manifests.

2. **Moderation can be undone by the member.** `admin-service.ts` uses `profiles.isPrivate` for HIDE_PROFILE/UNHIDE_PROFILE, and `profile-service.ts` lets the owner change the same field. Give moderation a separate server-owned visibility state and enforce it in public routes, directory and homepage queries. Unhiding should preserve the member's own privacy choice. Test a member trying to unhide a moderated profile.

3. **Docker build context protection.** `.dockerignore` excludes `.env.local` but does not exclude ordinary `.env`, other environment files or local database files. The Dockerfile copies the whole repository into its build and runner stages. Exclude credentials, local databases, development output and other private artifacts before building a release image; verify the image contents.

4. **Startup configuration validation is not wired in.** `webEnvSchema` and `botEnvSchema` exist but applications do not call them. Validate the correct environment at application startup, including a positive finite synchronization interval. Fail with a clear list of missing variable names, without printing values.

5. **Production identity and sync verification.** Browser testing confirmed the development Clerk Discord button loads and protected dashboard access sends signed-out visitors to `/login`. A real Discord OAuth callback, new Clerk account linking, production keys/domain configuration, production database migrations, live Gateway events and booster/staff role mappings were not exercised. Test with a standard member, booster, moderator, administrator and non-member before public release. Use the Discord server's actual booster role; owning Nitro by itself should not grant perks.

6. **Real lint and CI gates.** Workspace `lint` scripts currently print success messages rather than analyze code. Configure an actual linter and CI checks for tests, types, lint, web build and bot runtime/image startup. `pnpm lint` passing currently supplies no static-analysis assurance.

## Missing or incomplete MVP behavior

| Area | Current gap | Completion check |
| --- | --- | --- |
| Directory | Search submits a form; no live/debounced search, staff filter or pagination. Public results default to 60 and staff lists to 100. PR #11 moved staff search before that limit, so matching members outside the initial list can now be found. | Browse beyond the first page and filter current staff without exposing hidden roles. |
| Site settings | Maintenance and announcement values can be saved in admin but public pages do not consume them. | A saved announcement appears; maintenance actually gates intended routes with admin recovery access. |
| Moderation/audit | Role history UI is absent; audit rows are stored but not cryptographically tamper-evident. | State the intended guarantee, implement it, and verify actor/target/history behavior. |
| Data integrity | Link/tag replacement and several sync/moderation operations span multiple statements. | Inject a mid-operation failure and confirm transactions preserve the previous complete state. |
| Information pages | Footer `/privacy` and `/terms` links have no implemented pages. | Add accurate, owner-approved content and remove broken navigation. |
| Accessibility | Landing keyboard and reduced-motion paths are checked, but some existing header controls are 40px, and the complete app has no full accessibility audit. | Verify all required 44px controls, contrast, focus, errors and keyboard flows on authenticated pages. |
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
