# Website optimization review — 26 September 2026

The website now ships substantially smaller artwork, renders readable content before hydration, avoids sequential database round trips, and gives the ASC companion more expressive gestures and useful controls. This completes the optimization pass; it does not certify the unresolved production release gates in [READINESS_REVIEW.md](READINESS_REVIEW.md).

## Delivered changes

| Area | Result | Pull request |
| --- | --- | --- |
| Images and initial rendering | Responsive Discord avatar requests; explicit image dimensions; smaller WebP artwork; immutable caching restricted to versioned assets; page content visible without JavaScript; mascot loaded after idle time | [#10](https://github.com/Necookie/asc-monorepo/pull/10) |
| Database work | Parallel community/dashboard/admin reads; SQL search subqueries instead of downloading matching IDs; directory selects only card fields; database aggregates instead of complete member lists | [#11](https://github.com/Necookie/asc-monorepo/pull/11) |
| Correctness during optimization | Staff supporter totals count distinct active supporters; staff search runs before the 100-row limit; directory privacy remains enforced before search/filter limits | [#11](https://github.com/Necookie/asc-monorepo/pull/11) |
| Mascot presentation and controls | Dance break, glasses highlights, grounding shadow, unclipped gestures/confetti, readable action panel, Home/Back to corner, persistent pause and Tuck away, keyboard focus recovery | [#12](https://github.com/Necookie/asc-monorepo/pull/12) |
| Interaction efficiency | Mascot geometry measured on resize instead of every pointer frame; animation/tracking stops when paused, tucked, hidden or reduced motion is enabled | [#12](https://github.com/Necookie/asc-monorepo/pull/12) |
| Account and 3D loading | Server account navigation streams separately; loading state exposes no identity/actions; desktop WebGL waits for first paint and idle; phone/tablet/data-saver/2G use explicit Explore in 3D; reduced motion uses still artwork | [#13](https://github.com/Necookie/asc-monorepo/pull/13) |
| GPU budget | 64px reflection faces instead of 256px; 32 engraved ticks batched into one draw; asynchronous shader preparation where supported; still artwork during setup; pending callbacks ignored after disposal; instance buffers explicitly released | [#14](https://github.com/Necookie/asc-monorepo/pull/14) |

Original PNG artwork remains available as source material. Verified identity, booster/staff entitlements, profile privacy and server authorization rules are preserved. No shared cache of private member data was added.

## Measured download reductions

| Resource | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Mascot artwork | 1,310,317 bytes | 54,414 bytes | 95.8% |
| Landing background | 233,235 bytes | 99,046 bytes | 57.5% |
| Combined displayed artwork | 1,543,552 bytes | 153,460 bytes | 90.1% |
| Desktop first-party resource bodies | 1,985,873 bytes | 597,200 bytes | 69.9% |
| Mobile first-party resource bodies | 1,985,317 bytes | 452,723 bytes | 77.2% |
| JavaScript loaded during mobile visit | 351,625 bytes | 208,845 bytes | 40.6% |

First-party resource totals exclude the HTML document, transfer overhead and third-party bodies. Cross-origin Discord avatar entries report zero encoded bytes because their response timing does not expose that measurement; they are not free transfers. Desktop still loads the interactive 3D chunk automatically after idle, so its total measured JavaScript is essentially unchanged. Mobile can request that chunk explicitly later.

## Local lab evidence

Chromium visited the production build on an isolated migrated SQLite copy, with cache disabled, 4× CPU throttling, 40ms network latency and 200,000 bytes/second download throughput. Viewports were 1440×1050 desktop and 375×812 mobile, with a separate reduced-motion mobile visit. Measurements used browser performance observers and resource timing after network idle plus 1.5 seconds. The final recorded run had no concurrent browser tests. An earlier concurrent test/measurement run was discarded.

Baseline: `0364d315ee446b779997146425a5eecc56b764a7`. Final implementation: `a7218e7`, merged into `main` at `99be4e2`. Raw evidence: [before](performance/2026-09-26-before.json) and [after](performance/2026-09-26-after.json).

| Lab visit | Largest contentful paint, before → after | Layout shift, after | Long-task excess, before → after |
| --- | ---: | ---: | ---: |
| Desktop | 15.87s → 4.14s | 0.00011 | 5.48s → 2.16s |
| Mobile | 10.16s → 3.56s | 0.01144 | 5.22s → 0.90s |
| Reduced-motion mobile | 6.31s → 3.52s | 0 | 0.50s → 1.27s |

These are individual local lab observations, not field Core Web Vitals or a controlled statistical speed guarantee. The baseline desktop visit included a cold server start; final server timings were different. Software-rendered WebGL, external Clerk resources, font loading and machine workload affect timing. Long-task excess sums `max(duration − 50ms, 0)` for every observed long task; it is not Lighthouse TBT or interaction latency. The reduced-motion long-task result increased, so this pass does not claim every timing metric improved. Download reductions are the strongest repeatable evidence.

## Verification

- 150 tests across 19 files pass, including existing authorization/privacy suites and new loading, neutral account-state, supporter aggregate and staff-search regression checks.
- Workspace type checking and production web build pass. `pnpm lint` exits successfully but still runs placeholder scripts; it supplies no lint assurance.
- Production browser checks pass for desktop light/dark, tablet/mobile, overflow, invitation, 3D drag/arrows/Home/reset, reduced motion, WebGL absence and context loss, with no unexpected landing/login errors.
- Mascot browser checks pass for dance, drag, keyboard movement, reset, pause/tuck persistence, focus recovery, viewport bounds, reduced motion and exclusion from application/login routes.
- Separate checks confirm mobile/data-saver devices do not start WebGL automatically, explicit activation focuses the scene, remount does not steal focus, and desktop-to-tablet resize restores still artwork and the correct caption.
- Page headings remain visible with JavaScript disabled; versioned artwork responses include immutable caching.
- Actual Discord OAuth callbacks, authenticated browser saves, production role mapping and live Gateway synchronization remain external release checks. No production database writes or deployment commands were issued in this pass.

## Recommended next steps

1. Complete the bot packaging, server-owned moderation visibility, Docker context, environment validation and real lint/CI release gates documented in the readiness review.
2. Verify production Clerk Discord sign-in and profile saves with free members, boosters and staff, then run a small member pilot.
3. Collect real-device loading and interaction measurements before further tuning. If desktop GPU startup remains costly on member devices, keep 3D opt-in there too or use a precomputed environment texture. Do not broaden caching of membership, roles or private profiles without a reliable invalidation plan.
