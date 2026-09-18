# ADR 007: Profile Slug History & Alias Redirects

## Status
Accepted

## Context
Members of the community change their usernames periodically (e.g. from `dheyn` to `necookie`). If profile URLs are strictly tied to current usernames, existing links shared in Discord, social media, or personal portfolios immediately break (HTTP 404). Furthermore, if a member renames their account, their previous slug could potentially be grabbed by another user or collide with reserved system routes.

## Decision
Implement dedicated slug tracking in `profile_slugs`:
1. Every user has exactly one `is_primary = true` slug corresponding to their current username.
2. When a username change is detected, the old slug is retained with `is_primary = false` and `released_at = now`.
3. A new slug is inserted as `is_primary = true`.
4. Visiting a released slug alias triggers an HTTP `308 Permanent Redirect` to the user's primary slug.
5. If another community member legitimately changes their username to a previously released alias, the alias is reclaimed for the active user, avoiding permanent squatting.
6. Reserved routes (`admin`, `dashboard`, `api`, `members`, `login`, etc.) are blocked from slug allocation.

## Consequences
- Shared links continue to work seamlessly via permanent redirects.
- Clear deterministic behavior for slug collisions.
- Full historical traceability of member handles.
