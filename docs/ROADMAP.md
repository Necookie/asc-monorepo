# ASC — Product Roadmap

## 1. Version 1: MVP (Current Active Scope)

The goal of V1 is a secure, complete, production-ready community identity and member discovery platform adhering to the core identity invariant and visual specifications.

- **Core Identity & Synchronization**:
  - Automatic profile generation via Discord Gateway bot.
  - Immutable external ID (Discord Snowflake) identity anchor.
  - Real-time event handling (joins, leaves, rejoins, username changes, avatars).
  - Periodic reconciliation loop (drift healing).
  - Slug routing with 308 historical alias redirects.
- **Authentication & Ownership**:
  - Clerk OAuth with verified provider identity linking.
  - Server-side ownership protection and cross-profile mutation rejection.
- **Profile Customization**:
  - Bio, custom title, verified external links, custom theme/accent color.
  - Supporter external background URL with live fallback.
  - Granular server-side privacy controls.
  - Real-time local preview in dashboard.
- **Community Discovery**:
  - Homepage with community stats, hero, and showcase.
  - Member directory with live search and role filters.
- **Administration**:
  - Admin role-gated overview, member inspection, moderation actions, tag management, and audit logs.
- **Infrastructure & Quality**:
  - Turso/libSQL database with Drizzle ORM migrations.
  - Vercel-ready Next.js app and Dockerized bot daemon.
  - Full automated testing suite (unit, sync, auth, validation).

---

## 2. Version 2: Expression & Engagement (Future Scope)

*Not part of MVP implementation.*

- **Community Gamification**:
  - Experience Points (XP) and Levels.
  - Community engagement statistics (message frequency, event participation).
  - Achievement Badges and Quest milestones.
  - Supporter Leaderboards.
- **Advanced Cosmetics**:
  - Profile frames and animated avatar borders.
  - Dynamic nameplate shaders and gradient text.
  - Custom badge slots.
- **Community Events**:
  - Event calendar and participation badges.

---

## 3. Version 3: The Connected Canvas (Long-Term Horizon)

*Not part of MVP implementation.*

- **Modular Profile Widgets**:
  - Draggable, resizable widget grid.
  - Embedded GitHub contribution graph widget.
  - Embedded Spotify / music player now-playing widget.
  - Embedded Steam showcase widget.
- **Community Wrapped**:
  - Annual personalized recap for members and the community.
- **Decentralized & Multi-Platform Identity**:
  - Expanding to secondary community platforms while keeping canonical identity intact.
- **AI-Powered Community Discovery**:
  - Semantic member matchmaking based on shared skills, interests, and tags.
