# Local Discord sign-in review — 26 September 2026

## Report and evidence

Chrome on `http://localhost:3001` reportedly returns to `/` after Discord authentication and continues to look signed out. The specific Chrome session was not available to the automated browser, so its exact failure has not been reproduced.

Read-only checks found a verified Discord OAuth identity, a matching ACTIVE ASC member, an existing profile, and the correct Clerk linkage. The configured database has the current schema. Clerk's development cookie-independent session synchronization is already enabled; no instance settings were changed.

Real Discord OAuth in the available in-app browser reached the member's dashboard on port 3001 before and after the routing change. A dashboard reload retained authentication, and returning to the landing page displayed the correct account menu. These results establish a working local flow, not proof that the original Chrome-specific problem is resolved.

## Changes

- `/login/[[...sign-in]]` supports Clerk's nested callback and completion routes, including direct reloads. Nested steps finish in Clerk before ASC performs membership redirects.
- Discord uses the current page's redirect flow. The component explicitly supports both existing Clerk accounts and first-time OAuth account completion at `/login`; ASC profiles still originate from Discord membership synchronization.
- Provider and component redirects consistently target `/dashboard` for sign-in and first-time account completion.
- The account menu compares Clerk's loaded browser session with server-rendered account state. It requests one refresh per session transition or initial mismatch. An authenticated browser with a stale signed-out menu gets an `Open my profile` link instead of another sign-in attempt. A browser whose session has ended immediately loses cached member links.
- Authorization, identity matching, and dashboard mutations remain enforced on the server. Browser state only controls navigation and refresh behavior.

## Verification

- 161 tests across 20 files pass, including eight login-route cases and account-menu recovery tests. Re-running the recovery effect does not issue a second refresh for the same session.
- Workspace type checks and the web production build pass.
- `pnpm lint` completes, but the repository's scripts are placeholders and do not provide substantive lint coverage.
- Production HTTP checks return 200 for `/login`, `/login/sso-callback`, and `/login/continue` using an isolated local database. No real member customization was changed during verification.

## Chrome follow-up

Reload `http://localhost:3001/login` after the update and try Discord again. The expected destination is `/dashboard`, with the user's account in the navigation. If Chrome still returns to `/` with `Sign in`, compare a fresh Chrome session with the existing one and inspect Clerk-related browser errors and failed requests. Do not collect cookies, OAuth codes, session tokens, or credentials in a bug report.

First-time Discord account completion is covered by route/configuration regression tests; a second real Discord account was not created for testing. Production OAuth, profile saves, and production configuration remain separate release gates.

## References

- [Clerk SignIn component: routing, OAuth flow, and completion options](https://clerk.com/docs/nextjs/reference/components/authentication/sign-in)
- [Clerk development environments and session architecture](https://clerk.com/docs/guides/development/managing-environments)
- [Clerk development URL-based session synchronization](https://clerk.com/docs/reference/backend/instance/update)
