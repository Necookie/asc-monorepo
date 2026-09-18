# ADR 003: Immutable External User ID as Canonical Identity

## Status
Accepted

## Context
In community platforms like Discord, users frequently alter their display names, nicknames, and usernames. If an application ties database primary keys, relations, or authorization logic to usernames or URLs, a simple username rename results in broken links, broken foreign keys, or potential account takeover vulnerabilities.

## Decision
Enforce that the immutable external user ID (Discord Snowflake, e.g. `234567890123456789`) is the single canonical anchor of identity in ASC:
- `users.external_user_id` is `UNIQUE NOT NULL`.
- All authorization, ownership verification, role mapping, and history tie back to this immutable ID.
- Username is treated strictly as mutable presentation metadata.
- Slugs are treated strictly as mutable routing metadata.

## Consequences
- Complete immunity to account hijacking via username spoofing or reclaiming.
- Renaming a Discord username updates the ASC profile seamlessly without data loss or foreign key updates.
- Internal database relationships remain stable and immutable over the entire lifetime of a community member.
