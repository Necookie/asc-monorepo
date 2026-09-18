# ADR 004: No User Media File Storage

## Status
Accepted

## Context
Community profile systems often incur significant hosting, bandwidth, and legal moderation overhead when supporting direct user media uploads (S3, Cloudflare R2, image processing pipelines, virus scanning, CSAM scanning). Storing raw image blobs in a transactional database is also an anti-pattern.

## Decision
ASC MVP will **not** provide direct file upload endpoints, S3/R2 storage buckets, or database image blobs:
1. Community avatars are served directly via Discord's secure CDN URLs.
2. Custom profile backgrounds are stored as validated HTTPS URL strings pointing to external media.
3. The server never downloads, buffers, or proxies these external images, eliminating SSRF attack vectors.
4. The client browser renders background images directly with CSS fallbacks if the URL fails to load.

## Consequences
- Zero S3/R2 infrastructure cost, zero storage maintenance, and zero server image upload vulnerability surface.
- Broken or deleted external URLs gracefully fall back to the default ASC deep-indigo atmospheric gradient.
- Users must host their background artwork externally on reputable image hosting platforms or public CDNs.
