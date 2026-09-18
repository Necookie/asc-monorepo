# ASC — Product Specification

## 1. Product Vision

ASC (`asc.necookie.dev`) is a community-first digital identity, member discovery, and profile customization platform. It provides a permanent, expressive digital home for every member of the community.

Unlike traditional platforms where users must manually register, verify an email, and configure an account before being visible, ASC automatically provides a public profile to every current member of the community the moment they join.

```text
Community (Discord)
       ↓
Automatic Public Profile (asc.necookie.dev/[slug])
       ↓
Member Claims Profile via Clerk OAuth
       ↓
Customization & Expression (Bio, Links, Tags, Theme)
```

---

## 2. Target Users & Personas

1. **Community Member**: Wants to showcase their personality, projects, social links, and community tenure through an expressive, personalized profile page.
2. **Community Visitor / New Member**: Wants to explore the community directory, find members by interests or roles, and discover who makes up the community.
3. **Community Supporter / Booster**: Receives prominent visual recognition, custom profile titles, accent colors, and custom external background artwork.
4. **Community Moderator / Administrator**: Manages community-approved tags, oversees profile safety, reviews moderation audit logs, and configures site announcements.

---

## 3. The Core Problem Solved

In modern Discord-centric communities:
- Member profiles inside the chat client are constrained and fleeting.
- Discovery is difficult outside of active chat rooms.
- Linking to personal portfolios, GitHubs, and social presence is fragmented.
- Membership tenure, community roles, and special contributions get buried.

ASC bridges chat and the open web:
- Persistent, shareable URLs (`asc.necookie.dev/[username]`).
- Rich, personalized profiles adhering to a bespoke visual design language.
- Real-time synchronization of verified community roles and supporter badges.
- Centralized, searchable member directory.

---

## 4. Product Principles

1. **People Before Gamification**:
   ```text
   Community → People → Identity → Expression → Gamification
   ```
   Identity and personal expression are the focus. Levels, XP, and stats will never overshadow the human member.
2. **Automatic by Default**: If you are in the community, you exist on ASC. No manual signup barrier.
3. **Zero-Trust Synchronization**: Synchronized data (roles, join date, Discord avatar, handle) is read-only and authoritative from Discord. Members cannot fake their roles or tenure.
4. **Member Sovereignty & Privacy**: Members have granular server-enforced privacy controls to hide their roles, joined date, tags, or external links if desired.
5. **Expressive Yet Structured**: Members express themselves within a curated, beautiful visual system. No arbitrary HTML/JS injection.

---

## 5. Key Product Capabilities (MVP)

- **Automatic Member Profiles**: Instant profile generation on guild entry.
- **Synchronized Identity Card**: Read-only display of verified Discord avatar, handle, display name, roles, supporter tier, and membership tenure.
- **Profile Customization**:
  - Personal Biography (markdown-free sanitized text).
  - Custom Title (entitlement-gated for supporters).
  - External Verified Links (GitHub, Twitter, Portfolio, etc. with HTTPS validation).
  - Member Tags (selected from admin-approved community tags).
  - Custom Accent Color & Theme.
  - Custom External Background URL (entitlement-gated for supporters).
- **Member Directory (`/members`)**:
  - Live search across username, display name, and tags.
  - Role filters (Staff, Supporter, Members).
  - Supporter highlight badges.
- **Privacy Engine**:
  - Server-side stripping of hidden data (roles, membership date, tags, links, or complete profile privacy).
- **Administration & Moderation (`/admin`)**:
  - Member status inspection.
  - One-click profile moderation (hide profile, reset inappropriate fields).
  - Tag management (create, update, activate/deactivate allowed tags).
  - Immutable audit logging of all administrative actions.

---

## 6. Non-Goals (MVP Scope Boundaries)

The following are strictly out of scope for the MVP (reserved for V2/V3):
- XP, leveling, activity leaderboards, or message count tracking.
- Achievement systems or quest rewards.
- Drag-and-drop profile widget grids.
- Internal media hosting / S3 user file uploads (all images are URLs).
- In-platform direct messaging or commenting on profiles.
- Custom CSS / arbitrary JavaScript injection by users.
