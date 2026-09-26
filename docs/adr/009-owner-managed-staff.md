# ADR 009: Owner-managed website staff

Status: Accepted (26 September 2026)

## Context

The community owner wants to establish their main account in Clerk and delegate website management from a highest-permission dashboard. Discord remains authoritative for community membership and displayed roles, but those roles must not automatically confer website administrative authority.

## Decision

Read exact private Clerk metadata role owner on the authenticated server user, requiring verified Discord identity and active membership. Store delegated ADMIN/MODERATOR assignments in ASC, never OWNER. Restrict all staff assignment reads and mutations to owners. Moderators hide/restore profiles; admins additionally manage existing administrative tools and customization grants. Each mutation is authorized on the server, and access changes and audit records share a transaction.

Keep member privacy separate from moderation visibility. Suspend website staff and customization grants for inactive membership. Preserve profile content, dormant assignments, and Discord-earned customization capabilities.

## Consequences

Initial owner setup and owner removal happen in Clerk, outside the website. Fixed levels avoid an ambiguous permission editor. Website staff access no longer follows Discord admin/moderator flags. Search is bounded to 100 matches; granular permissions and pagination can be designed later. Audit records are not cryptographically tamper-evident.
