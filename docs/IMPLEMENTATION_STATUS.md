# ASC — Live Implementation Status Matrix

## Current release assessment — 26 September 2026

**MVP release readiness: incomplete.** Historical phase checks below describe implementation work, not a verified production release. [READINESS_REVIEW.md](READINESS_REVIEW.md) records the current blockers and corrects earlier completion claims.

| Current work | Result | Verification |
| --- | --- | --- |
| Member sign-in, session recovery and ASC account menu | Merged through PRs #1–#2 | Session/identity/menu tests; signed-out browser redirect and embedded Discord button |
| Local Discord OAuth routing and account recovery | Verified locally; see [auth review](LOCAL_AUTH_REVIEW.md) | Real Discord OAuth on port 3001, dashboard reload and landing account menu; original Chrome session not reproduced |
| Discord invite and Clerk browser policy | Merged through PRs #3–#4 | Correct invite destinations; blocked worker errors resolved |
| Sculpted landing emblem and accessible controls | Merged through PR #5 | Graphics tests; desktop/light/dark/tablet/mobile, drag/arrows/reset, reduced motion/WebGL/context-loss fallback |
| Public action identity boundaries | Merged through PR #6 | Forged member/admin/database arguments rejected; expired-session redirects preserved |
| Booster and moderator/admin customization | Merged through PR #7 | Verified role flags; former-member privileges revoked; saved appearance retained |
| Directory privacy | Merged through PR #8 | Hidden profiles/roles/tags excluded from discovery, search and supporter filters |
| Website optimization and expressive mascot | Merged through PRs #10–#14 | Smaller assets, parallel/private-safe queries, streaming account navigation, mobile 3D activation, GPU batching, companion controls; [optimization evidence](OPTIMIZATION_REVIEW.md) |
| Current local gates | 161 tests in 20 files; types and web build pass | Lint scripts remain placeholders; compiled bot startup fails on shared TypeScript package entrypoints |
| Remaining production evidence | Pending | Real OAuth linking/saves, live Gateway lifecycle, Docker image boot, production role mappings and migrations |

## Historical implementation phases

| Subsystem | Status | Branch | Key Files | Tests | Blockers | Next Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 0: Bootstrap** | `VERIFIED` | `main` (merged `chore/repository-bootstrap`) | `.gitignore`, `package.json`, `pnpm-workspace.yaml`, `README.md` | Initial workspace check | Remote GitHub push requires auth (`BLOCKED`) | Completed |
| **Phase 1: Docs & Specs** | `VERIFIED` | `main` (merged `docs/project-specification`) | `AGENTS.md`, `docs/*`, `docs/adr/*` | Complete specification review | None | Completed |
| **Phase 2: Monorepo Foundation** | `VERIFIED` | `main` (merged `feature/project-foundation`) | `packages/*`, `tsconfig.base.json`, `vitest.config.ts` | Base package unit tests (22/22 passed) | None | Completed |
| **Phase 3: Database** | `VERIFIED` | `main` (merged `feature/database`) | `packages/db/src/schema/*`, `migrate.ts`, `seed.ts` | DB constraint & relation tests (4/4 passed, 26/26 overall) | None | Completed |
| **Phase 4: Synchronization** | `VERIFIED` | `main` (merged `feature/member-synchronization`) | `apps/bot/src/*` | Sync lifecycle, idempotency, and reconciliation tests (9/9 passed, 35/35 overall) | Live Discord Gateway requires bot token (`EXTERNAL VERIFICATION BLOCKED`) | Completed |
| **Phase 5: Design Foundation** | `VERIFIED` | `main` (merged `feature/design-system`) | `apps/web/components/*`, `globals.css` | Component render checks (10/10 passed, 45/45 overall) | None | Completed |
| **Phase 6: Public Website** | `VERIFIED` | `main` (merged `feature/public-community`) | `apps/web/app/*`, `[slug]/page.tsx`, `lib/queries/*` | Route, privacy & query tests (9/9 passed, 54/54 overall) | None | Completed |
| **Phase 7: Authentication** | `VERIFIED` | `main` (merged `feature/authentication`) | `apps/web/lib/auth/*`, `middleware.ts`, `app/login/page.tsx` | Auth extraction, identity linking, zero-trust & role tests (18/18 passed, 72/72 overall) | None | Completed |
| **Phase 8: Customization** | `VERIFIED` | `main` (merged `feature/profile-customization`) | `apps/web/app/dashboard/*`, `lib/actions/profile.ts`, `components/dashboard/*` | Actions & entitlement tests (14/14 passed, 86/86 overall) | None | Completed |
| **Phase 9: Administration** | `VERIFIED` | `main` (merged `feature/administration`) | `apps/web/app/admin/*`, `lib/actions/admin.ts`, `components/admin/*` | Admin authorization & moderation tests (11/11 passed, 97/97 overall) | None | Completed |
| **Phase 10: Security & Quality** | `VERIFIED` | `main` (merged `feature/security-hardening`) | `apps/web/next.config.ts`, `packages/validation`, security test suite | End-to-end security, CSP, sanitization & a11y tests (9/9 passed, 106/106 overall) | None | Completed |
| **Phase 11: Deployment** | `VERIFIED` | `main` (merged `feature/deployment`) | `apps/bot/Dockerfile`, `apps/web/Dockerfile`, `compose.yaml`, `docs/DEPLOYMENT.md` | Multi-stage Docker configurations, healthcheck route, compose orchestrations | None | Completed |
| **Phase 12: Final MVP Audit** | `VERIFIED` | `chore/mvp-final-audit` | Full repository review | Full suite: lint, typecheck, test, build (106/106 tests passed) | None | Complete |
| **Phase 13: Mascot & Arcade Visual System** | `VERIFIED` | `main` (merged `feature/mascot-interactions`, `feature/arcade-visual-system`) | `components/motion/community-mascot.tsx`, `member-wall.tsx`, `globals.css` | 106 tests, typecheck, lint, build, desktop/mobile browser review | None | Complete |
| **Phase 14: Interactive 3D** | `VERIFIED` | `main` (merged `feature/interactive-3d`) | `components/motion/arcade-stage.tsx`, `arcade-scene.tsx` | 106 tests, typecheck, lint, build, browser drag and theme review | None | Complete |
| **Phase 15: Profile Studio** | `VERIFIED` | `main` (merged `feature/profile-appearance-studio`) | `drizzle/0001_tough_mach_iv.sql`, `profile-display.tsx`, `profile-customizer.tsx` | 113 tests, typecheck, lint, build, desktop/mobile browser review | None | Complete |

---

## Remote Push Status
- **Canonical Remote**: `origin https://github.com/Necookie/asc-monorepo.git`
- **Current Status**: `OPERATIONAL` (Changes successfully synced to origin `main`).
