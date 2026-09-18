# ADR 002: Use Clerk for Authentication & Provider Identity

## Status
Accepted

## Context
ASC profiles originate automatically from Discord community membership prior to any website login. When an existing member wishes to customize their profile, they authenticate through the website. We need a secure, managed authentication service that provides Discord OAuth out of the box, handles session tokens, session revocation, and multi-factor authentication, while allowing ASC to bind the authenticated identity to our pre-existing database member records.

## Decision
Use **Clerk** (`@clerk/nextjs`) for session management and OAuth authentication.
1. Clerk natively supports Discord OAuth with verified provider identity claims.
2. The ASC web application extracts the verified Discord Snowflake (`providerUserId`) from Clerk user external accounts.
3. ASC links this verified Snowflake to `users.clerk_user_id` in Turso.
4. ASC never implements custom password storage, session cookie cryptography, or token refresh routines.

## Consequences
- Offloads authentication vulnerability surface and session management to a proven provider.
- Profile ownership remains decoupled: Clerk manages auth, but ASC Turso database manages identity, permissions, and profile data.
- Testing requires mock auth headers / mock session context when running offline unit tests.
