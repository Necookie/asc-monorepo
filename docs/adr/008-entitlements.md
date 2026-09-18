# ADR 008: Dynamic Entitlement Engine

## Status
Accepted

## Context
ASC grants perks to supporters and contributors, such as custom profile titles, custom accent colors, external background images, and increased link limits. Hardcoding checks like `if (user.isSupporter)` across multiple components, Server Actions, and validation schemas creates tight coupling and makes introducing new perks (e.g. tier-2 supporter, event badges, staff privileges) error-prone.

## Decision
Create a centralized, generic entitlement evaluation engine in `packages/entitlements`:
1. Capabilities are defined as discrete string keys:
   - `'profile.background'`: Ability to set an external background image.
   - `'profile.custom_title'`: Ability to configure a profile title.
   - `'profile.gradient'`: Access to custom gradient accents.
   - `'profile.max_tags'`: Number of allowed tags (default: 5).
   - `'profile.max_links'`: Number of allowed links (default: 5, supporter: 10).
2. The entitlement engine resolves effective capabilities from multiple sources:
   - Discord server booster / supporter role.
   - Discord staff / moderator roles.
   - Explicit grants in the `entitlements` table.
3. If supporter status lapses, entitlements deactivate without deleting saved custom data in the database, allowing immediate restoration if supporter status is renewed.

## Consequences
- Clean separation between business logic and UI presentation.
- Decouples feature gates from specific Discord role IDs.
- Effortlessly extensible to future V2/V3 features (levels, achievements, cosmetics).
